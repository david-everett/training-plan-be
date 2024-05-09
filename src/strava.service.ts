import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WeekData, LongRun } from './strava.interfaces';

@Injectable()
export class StravaService {
  private supabaseClient: SupabaseClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async getRunningStats(userId: string): Promise<{
    totalRuns: number;
    totalMiles: number;
    lastRunDate: string;
    weeks: WeekData[];
    longRuns: LongRun[];
  }> {
    // Fetch the access token for the provided userId from your database or cache
    const accessToken = await this.getAccessTokenForUser(userId);

    if (!accessToken) {
      throw new Error('Access token not found for the provided user ID');
    }

    const perPage = 200;
    const totalPages = 2;
    let allActivities: any[] = [];

    for (let page = 1; page <= totalPages; page++) {
      const url = 'https://www.strava.com/api/v3/athlete/activities';
      const headers = { Authorization: `Bearer ${accessToken}` };
      const params = { per_page: perPage, page: page };

      const response = await this.httpService
        .get(url, { headers, params })
        .pipe(map((res) => res.data))
        .toPromise();

      allActivities = [...allActivities, ...response];
    }

    const runs = allActivities.filter((activity) => activity.type === 'Run');

    const totalRuns = runs.length;
    const totalMiles = runs.reduce(
      (sum, run) => sum + run.distance / 1609.34,
      0,
    );

    const lastRunDate =
      runs.length > 0
        ? moment(runs[runs.length - 1].start_date).format('YYYY-MM-DD')
        : null;

    const weeks: WeekData[] = [];
    for (let i = 0; i < 10; i++) {
      const startDate = moment().startOf('week').subtract(i, 'weeks');
      const endDate = moment().endOf('week').subtract(i, 'weeks');
      const weekRuns = runs.filter((run) =>
        moment(run.start_date).isBetween(startDate, endDate, null, '[]'),
      );
      const weekMiles = weekRuns.reduce(
        (sum, run) => sum + run.distance / 1609.34,
        0,
      );
      weeks.push({
        startDate: startDate.format('YYYY-MM-DD'),
        totalMiles: parseFloat(weekMiles.toFixed(2)),
      });
    }

    const longRuns: LongRun[] = runs
      .filter((run) => run.distance >= 32186.9) // 20 miles in meters
      .map((run) => ({
        date: moment(run.start_date).format('YYYY-MM-DD'),
        time: moment.utc(run.elapsed_time * 1000).format('HH:mm:ss'),
        distance: parseFloat((run.distance / 1609.34).toFixed(2)),
      }));

    const runningStats = {
      totalRuns,
      totalMiles: parseFloat(totalMiles.toFixed(2)),
      weeks,
      longRuns,
      lastRunDate,
    };

    // Store the running stats in the Supabase database
    const { data, error } = await this.supabaseClient
      .from('running_stats')
      .insert({ user_id: userId, training_data: runningStats })
      .single();

    if (error) {
      throw new Error('Failed to store running stats in the database');
      console.log('Supabase error:', error);
    }

    return runningStats as {
      totalRuns: number;
      totalMiles: number;
      weeks: WeekData[];
      longRuns: LongRun[];
      lastRunDate: string;
    };
  }

  private async getAccessTokenForUser(userId: string): Promise<string | null> {
    const { data, error } = await this.supabaseClient
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error retrieving access token:', error.message);
      return null;
    }

    return data?.access_token || null;
  }
}
