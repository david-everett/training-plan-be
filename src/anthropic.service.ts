import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import {
  TRAINING_DATA,
  RACE_INFO,
  TRAINING_PLAN_DOCUMENT,
  HALF_MARATHON_TRAINING_PLAN_DOCUMENT,
  FIVE_K_TRAINING_PLAN_DOCUMENT,
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
  getRaceWeekStartDate,
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
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async generateTrainingPlan(
    userId: string,
    race: string,
    date: string,
    userRunningData: UserRunningData,
    longRun: number,
    numMaxLongRuns: number,
    weeklyMileage: number,
    approach: string,
  ): Promise<{
    trainingPlan: string;
    tokenUsage: { inputTokens: number; outputTokens: number };
  }> {
    const currentDate = new Date();
    const startDate = getStartDate(currentDate);
    const finalWeek = getRaceWeekStartDate(date);
    const lastFewWeeksMileage = getLastFewWeeksMileage(
      userRunningData,
      4,
      currentDate,
    );
    const currentCondition = getCurrentCondition(weeklyMileage, race);

    function getHighMileageText(
      currentMileage: number,
      highMileage: number,
    ): string {
      if (currentMileage < highMileage * 0.5) {
        return `reached only once during the week of ${getHighMileageWeekDate(
          date,
        )}`;
      } else {
        return '';
      }
    }

    const prompt = `<documents>
    ${
      race === 'Marathon'
        ? TRAINING_PLAN_DOCUMENT
        : HALF_MARATHON_TRAINING_PLAN_DOCUMENT
    }
    </documents>

    <system>
    You are a ${race} training coach helping runners in the future. Use the attached training plan as a guide to create a personalized ${race} training plan in JSON format. The plan should start on ${
      startDate.toISOString().split('T')[0]
    } and lead up to race which is during the week of ${finalWeek}.
    
    Current Week Mileage:
    - I have run ${getCurrentWeekMileage(
      userRunningData,
      currentDate,
    )} miles so far this week.
    - There are ${7 - currentDate.getDay()} days remaining in the current week.
  
    Current Condition:
    - I am a ${currentCondition} runner, currently running an average of ${lastFewWeeksMileage} miles per week.

    Initial Mileage Build-Up:
    - ${
      longRun < lastFewWeeksMileage
        ? `- Since the target long run distance (${longRun} miles) is lower than my current weekly mileage (${lastFewWeeksMileage} miles), start the plan at my current mileage level and maintain it for the first few weeks.`
        : `- Gradually increase mileage, starting from my current ${lastFewWeeksMileage} miles per week.`
    }
    - Include rest weeks every 3-4 weeks to allow for recovery.
    - ${getHoldMileageText(approach, weeklyMileage)}


    Key Training Milestones:
    - Include ${numMaxLongRuns} ${longRun}-mile long runs on the following weeks: ${getMaxLongRunDates(
      date,
      numMaxLongRuns,
    )}. You may only includes runs at ${longRun} on those dates.
    - Each week should be ${weeklyMileage} miles or less, ${getHighMileageText(
      lastFewWeeksMileage,
      weeklyMileage,
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
    - The third week and final week of the training plan MUST start on ${finalWeek}. The mileage for this week should be 20% - 30% of the peak week plus the ${
      race === 'Marathon' ? '26.2' : race === 'Half Marathon' ? '13.1' : ''
    } mile long run for race day.

    Ensure that the plan strictly follows these requirements:
    1. The ${numMaxLongRuns} ${longRun}-mile long runs must be scheduled for the weeks of ${getMaxLongRunDates(
      date,
      numMaxLongRuns,
    )}.
    2. All long runs outside of ${getMaxLongRunDates(
      date,
      numMaxLongRuns,
    )} should be a max distance of ${longRun - 2}
    3. The weekly mileage must not exceed ${weeklyMileage} miles.
    4. Rest weeks must be included after high-mileage weeks and the ${longRun}-mile long runs.
    5. The final 3-week taper should follow the mileage and long run guidelines provided above, with decreasing mileage and long run distances each week.
    6. Weeks start on Monday starting with the first week being ${
      startDate.toISOString().split('T')[0]
    }

    Please provide the plan strictly in valid JSON format, with each weekly entry enclosed in curly braces and key value pairs for "week" which is the date of the Monday to start the week, "total miles", and "long run". It is imperative that you stick to these column names.
    Ensure the plan aligns with the progressive mileage increase, key training milestones, and tapering period outlined above.

    Return only the JSON object, without any additional text or explanations.
    It is crucial that you return the plan as a valid JSON object, without any additional text or explanations. The JSON object should be parsable by standard JSON parsers.
    </system>
    `;

    console.log(prompt);
    const response = await this.callAnthropicApi(prompt);
    if (!response.content[0] || !response.content[0].text) {
      console.log(response);
      throw new Error('Unexpected response from Anthropic API');
    }

    const parsedPlan = JSON.parse(response.content[0].text);

    return {
      trainingPlan: parsedPlan,
      tokenUsage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  async callAnthropicApi(prompt: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-opus-20240229',
          // temperature: 0.,
          max_tokens: 4096,
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

  async generateShortRaceTrainingPlan(
    userId: string,
    race: string,
    date: string,
    userRunningData: UserRunningData,
    longRun: number,
    numMaxLongRuns: number,
    weeklyMileage: number,
    approach: string,
  ): Promise<{
    trainingPlan: string;
    tokenUsage: { inputTokens: number; outputTokens: number };
  }> {
    const currentDate = new Date();
    const startDate = getStartDate(currentDate);
    const finalWeek = getRaceWeekStartDate(date);
    const lastFewWeeksMileage = getLastFewWeeksMileage(
      userRunningData,
      4,
      currentDate,
    );
    const currentCondition = getCurrentCondition(weeklyMileage, race);

    function getHighMileageText(
      currentMileage: number,
      highMileage: number,
    ): string {
      if (currentMileage < highMileage * 0.5) {
        return `reached only once during the week of ${getHighMileageWeekDate(
          date,
        )}`;
      } else {
        return '';
      }
    }
    const prompt = `<documents>
${FIVE_K_TRAINING_PLAN_DOCUMENT}
</documents>

<system>
You are a ${race} training coach helping runners in the future. Use the attached training plan as a guide to create a personalized ${race} training plan in JSON format. The plan should start on ${
      startDate.toISOString().split('T')[0]
    } and lead up to the race which is during the week of ${finalWeek}.
${
  weeklyMileage > 26
    ? `It is okay to include higher mileage weeks than what is specified in the plan. Please cap the weekly milage at ${weeklyMileage}`
    : ''
}

Current Week Mileage:
- I have run ${getCurrentWeekMileage(
      userRunningData,
      currentDate,
    )} miles so far this week.
- There are ${7 - currentDate.getDay()} days remaining in the current week.

Current Condition:
- I am a ${currentCondition} runner, currently running an average of ${lastFewWeeksMileage} miles per week.

Initial Mileage Build-Up:
- ${
      weeklyMileage < lastFewWeeksMileage
        ? `Since the target long run distance (${weeklyMileage} miles) is lower than my current weekly mileage (${lastFewWeeksMileage} miles), start the plan at my current mileage level and maintain it for the first few weeks.`
        : `Gradually increase mileage, starting from my current ${lastFewWeeksMileage} miles per week.`
    }
- Include rest weeks every 3-4 weeks to allow for recovery.
- ${getHoldMileageText(approach, weeklyMileage)}

Key Training Milestones:
    - Include ${numMaxLongRuns} ${longRun}-mile long runs on the following weeks: ${getMaxLongRunDates(
      date,
      numMaxLongRuns,
    )}. You may only includes runs at ${longRun} on those dates.
    - Each week should be ${weeklyMileage} miles or less, ${getHighMileageText(
      lastFewWeeksMileage,
      weeklyMileage,
    )}.

Rest Weeks:
- Explicitly include rest weeks, particularly following high-mileage weeks.

Final Taper:
- Include a 1-2 week tapering period leading up to the ${race} race.
- Week 1 of taper: Reduce mileage to about 80% of the peak week
- Week 2 of taper (race week): Further reduce mileage to about 60% of the peak week

Ensure that the plan strictly follows these requirements:
1. The weekly mileage must not exceed ${weeklyMileage} miles.
2. Rest weeks must be included after high-mileage weeks.
3. The final 1-2 week taper should follow the mileage and long run guidelines provided above, with decreasing mileage and long run distances each week.
4. Weeks start on Monday starting with the first week being ${
      startDate.toISOString().split('T')[0]
    }.
5. Round the weekly mileage to the nearest whole number of miles.

Please provide the plan strictly in valid JSON format, with each weekly entry enclosed in curly braces and key-value pairs for "week" which is the date of the Monday to start the week, "total miles", and "long run". It is imperative that you stick to these column names.
Ensure the plan aligns with the progressive mileage increase, key training milestones, and tapering period outlined above.

Return ONLY the JSON object, without any additional text, explanations, or other formatting. It is crucial that you return ONLY the JSON data, as any additional text will cause parsing errors. The JSON object should be directly parsable by standard JSON parsers without any modifications.
</system>
`;
    console.log(prompt);
    const response = await this.callAnthropicApi(prompt);
    if (!response.content[0] || !response.content[0].text) {
      console.log(response);
      throw new Error('Unexpected response from Anthropic API');
    }

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Response text:', response.content[0].text);
      throw new Error('Invalid JSON response from Anthropic API');
    }

    return {
      trainingPlan: parsedPlan,
      tokenUsage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
