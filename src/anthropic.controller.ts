import { Controller, Post, Body } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { getStartDate, parseTrainingPlan } from './trainingPlanHelper';
import { checkFirstWeekDate, checkMaxLongRun } from './trainingPlanChecks';

@Controller('anthropic')
export class AnthropicController {
  private supabaseClient: SupabaseClient;

  constructor(
    private readonly anthropicService: AnthropicService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  @Post('training-plan')
  async createTrainingPlan(
    @Body('userId') userId: string,
    @Body('raceName') raceName: string,
    @Body('race') race: string,
    @Body('date') date: string,
    @Body('longRun') longRun: number,
    @Body('numMaxLongRuns') numMaxLongRuns: number,
    @Body('weeklyMileage') weeklyMileage: number,
    @Body('approach') approach: string,
  ): Promise<any> {
    // Fetch the user's running data from Supabase
    const { data: runningStatsData, error: runningStatsError } =
      await this.supabaseClient
        .from('running_stats')
        .select('training_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (runningStatsError) {
      throw new Error(
        `Error fetching user's running stats: ${runningStatsError.message}`,
      );
    }

    const expectedStartDate = getStartDate(new Date())
      .toISOString()
      .split('T')[0];
    let trainingPlan;
    let trainingPlanId: number;
    let attempts = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const maxAttempts = 1;

    while (attempts < maxAttempts) {
      const { trainingPlan: plan, tokenUsage } =
        await this.anthropicService.generateTrainingPlan(
          userId,
          raceName,
          race,
          date,
          runningStatsData.training_data,
          longRun,
          numMaxLongRuns,
          weeklyMileage,
          approach,
        );

      totalInputTokens += tokenUsage.inputTokens;
      totalOutputTokens += tokenUsage.outputTokens;
      console.log(plan);

      if (
        checkFirstWeekDate(plan, expectedStartDate) &&
        checkMaxLongRun(plan, longRun)
      ) {
        trainingPlan = plan;
        const totalInputCost = (totalInputTokens / 1000000) * 15;
        const totalOutputCost = (totalOutputTokens / 1000000) * 75;
        const totalCost = totalInputCost + totalOutputCost;
        // Save the valid training plan to Supabase
        const { data, error } = await this.supabaseClient
          .from('training_plans')
          .insert({
            user_id: userId,
            plan: parseTrainingPlan(JSON.stringify(trainingPlan)),
            race_name: raceName,
            race: race,
            date: date,
            cost: totalCost,
          })
          .select('id')
          .single<any>();

        if (error) {
          throw new Error(`Error saving training plan: ${error.message}`);
        }
        trainingPlanId = data.id;
        break;
      }
      attempts++;
    }

    if (attempts === maxAttempts) {
      // console.log('Generated training plan:', trainingPlan);
      console.log(
        'First week date check:',
        checkFirstWeekDate([trainingPlan], expectedStartDate),
      );
      console.log(
        'Max long run check:',
        checkMaxLongRun([trainingPlan], longRun),
      );
      throw new Error(
        'Failed to generate a valid training plan after multiple attempts',
      );
    }

    return {
      trainingPlan,
      trainingPlanId,
      attempts: attempts + 1,
    };
  }
}
