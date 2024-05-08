import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import {
  TRAINING_DATA,
  RACE_INFO,
  TRAINING_PLAN_DOCUMENT,
} from './training-data.constants';
import { HttpService } from '@nestjs/axios';
import {
  getCurrentCondition,
  getHoldMileageText,
  getLastFewWeeksMileage,
  getCurrentWeekMileage,
  getStartDate,
  getNextFullWeek,
  UserRunningData,
  getMaxLongRunDates,
  getHighMileageWeekDate,
  parseTrainingPlan,
} from './trainingPlanHelper';

@Injectable()
export class AnthropicService {
  private supabase: SupabaseClient;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_KEY'),
    );
  }

  async generateTrainingPlan(
    userId: string,
    raceName: string,
    race: string,
    date: string,
    userRunningData: UserRunningData,
    longRun: number,
    numMaxLongRuns: number,
    weeklyMileage: number,
    approach: string,
  ): Promise<any> {
    const currentDate = new Date();
    const startDate = getStartDate(currentDate);
    const lastFewWeeksMileage = getLastFewWeeksMileage(
      userRunningData,
      4,
      currentDate,
    );
    const currentCondition = getCurrentCondition(weeklyMileage);

    const prompt = `<documents>
    ${TRAINING_PLAN_DOCUMENT}
    </documents>

    <system>
    You are a ${race} training coach. Use the attached training plan as a guide to create a personalized ${race} training plan in JSON format. The plan should start on ${
      startDate.toISOString().split('T')[0]
    } and lead up to the race day on ${new Date(date).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    )}.
    
    Current Week Mileage:
    - I have run ${getCurrentWeekMileage(
      userRunningData,
      currentDate,
    )} miles so far this week.
    - There are ${7 - currentDate.getDay()} days remaining in the current week.

    Current Condition:
    - I am a ${currentCondition} runner, currently running an average of ${lastFewWeeksMileage} miles per week.

    Initial Mileage Build-Up:
    - Gradually increase mileage, starting from my current ${lastFewWeeksMileage} miles per week.
    - Include rest weeks every 3-4 weeks to allow for recovery.


    Key Training Milestones:
    - Include ${numMaxLongRuns} ${longRun}-mile long runs on the following dates: ${getMaxLongRunDates(
      date,
      numMaxLongRuns,
    )}.
    - Cap the weekly mileage at ${weeklyMileage} miles, reached only once during the week of ${getHighMileageWeekDate(
      date,
    )}.
    - Include long runs of ${longRun - 2} to ${
      longRun - 4
    } miles 2 weeks before the first ${longRun}-mile long run and 2 weeks after the last ${longRun}-mile long run.

    Rest Weeks:
    - Explicitly include rest weeks, particularly following high-mileage weeks and the ${longRun}-mile long runs.

    Final Taper:
    - Include a 3-week tapering period leading up to the ${race}, similar to the attached plans.
    - Week 1 of taper (after the last ${longRun}-miler): Reduce mileage to about 70% of the peak week, with a long run of ${Math.round(
      longRun * 0.6,
    )} miles.
    - Week 2 of taper: Further reduce mileage to about 50% of the peak week, with a long run of ${Math.round(
      longRun * 0.4,
    )} miles.
    - Final week, race week: The mileage should be 20% - 30% of the peak plus the 26.2 mile long run for race week.

    Ensure that the plan strictly follows these requirements:
    1. The ${numMaxLongRuns} ${longRun}-mile long runs must be scheduled with the last one three weeks before the race and any previous ones two weeks apart.
    2. The weekly mileage must not exceed ${weeklyMileage} miles, and this should only occur once during the week of the final ${longRun}-mile long run.
    3. Rest weeks must be included after high-mileage weeks and the ${longRun}-mile long runs.
    4. The final 3-week taper should follow the mileage and long run guidelines provided above, with decreasing mileage and long run distances each week.

    Please provide the plan strictly in valid JSON format, with each weekly entry enclosed in curly braces and key value pairs for "week" which is the date of the Monday to start the week, "total miles", and "long run". It is imperative that you stick to these column names.
    Ensure the plan aligns with the progressive mileage increase, key training milestones, and tapering period outlined above.

    Return only the JSON object, without any additional text or explanations.
    It is crucial that you return the plan as a valid JSON object, without any additional text or explanations. The JSON object should be parsable by standard JSON parsers.

    Think through all of the rules before coming up with a plan.
    </system>
    `;

    const response = await this.callAnthropicApi(prompt);

    if (!response.content[0] || !response.content[0].text) {
      console.log(response);
      throw new Error('Unexpected response from Anthropic API');
    }

    // Save the training plan to Supabase
    const { data, error } = await this.supabase
      .from('training_plans')
      .insert({
        user_id: userId,
        plan: parseTrainingPlan(response.content[0].text),
        race_name: raceName,
        race: race,
        date: date,
      })
      .single();

    if (error) {
      throw new Error(`Error saving training plan: ${error.message}`);
    }

    return response.content[0].text;
  }

  async callAnthropicApi(prompt: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 2500,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'x-api-key': this.configService.get('ANTHROPIC_API_KEY'),
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error calling Anthropic API:', error.response.data);
      throw error;
    }
  }
}
