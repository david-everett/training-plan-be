import { Controller, Post, Body } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Controller('anthropic')
export class AnthropicController {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly anthropicService: AnthropicService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_KEY'),
    );
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
      await this.supabase
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
