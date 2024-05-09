import { Controller, Post, Body } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

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

    const trainingPlan = await this.anthropicService.generateTrainingPlan(
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

    return trainingPlan;
  }
}
