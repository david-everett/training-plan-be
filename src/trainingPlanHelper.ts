export interface Week {
  startDate: string;
  totalMiles: number;
}

export interface UserRunningData {
  weeks: Week[];
  // other properties
}

export function getCurrentWeekMileage(
  userData: UserRunningData,
  currentDate: Date,
): number {
  const currentWeek = userData.weeks.find((week) => {
    const weekStartDate = new Date(week.startDate);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    return currentDate >= weekStartDate && currentDate <= weekEndDate;
  });

  if (currentWeek) {
    return currentWeek.totalMiles;
  }

  return 0;
}

export function getLastFewWeeksMileage(
  userData: UserRunningData,
  numWeeks: number,
  currentDate: Date,
): number {
  const sortedWeeks = userData.weeks.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  const recentFullWeeks = sortedWeeks.slice(1, numWeeks + 1);
  const totalMileage = recentFullWeeks.reduce(
    (sum, week) => sum + week.totalMiles,
    0,
  );
  const averageMileage = totalMileage / numWeeks;

  const mostRecentWeekMileage = recentFullWeeks[0].totalMiles;
  const recommendedMileage = Math.max(averageMileage, mostRecentWeekMileage);

  return recommendedMileage;
}

export function getStartDate(currentDate: Date): Date {
  const startDate = new Date(currentDate);
  const dayOfWeek = startDate.getDay();

  if (dayOfWeek === 1) {
    // If today is Monday, start the plan today
    return startDate;
  } else {
    // Otherwise, start the plan from the previous Monday
    startDate.setDate(startDate.getDate() - ((dayOfWeek + 6) % 7));
    return startDate;
  }
}

export function getCurrentCondition(weeklyMileage: number): string {
  if (weeklyMileage > 50) {
    return 'advanced';
  } else if (weeklyMileage >= 40) {
    return 'intermediate';
  } else {
    return 'novice';
  }
}
export function getNextFullWeek(dateString: string): string {
  const date = new Date(dateString);
  const nextMonday = new Date(
    date.setDate(date.getDate() + ((7 - date.getDay() + 1) % 7 || 7)),
  );
  return nextMonday.toISOString().split('T')[0];
}

export function getHoldMileageText(
  approach: string,
  weeklyMileage: number,
): string {
  let mileageRange: string;

  switch (approach) {
    case 'buildSlowly':
      mileageRange = `${Math.round(weeklyMileage * 0.45)}-${Math.round(
        weeklyMileage * 0.55,
      )}`;
      break;
    case 'buildAndRelax':
      mileageRange = `${Math.round(weeklyMileage * 0.55)}-${Math.round(
        weeklyMileage * 0.64,
      )}`;
      break;
    case 'fullSend':
      mileageRange = `${Math.round(weeklyMileage * 0.64)}-${Math.round(
        weeklyMileage * 0.73,
      )}`;
      break;
    default:
      return '';
  }

  return `Because we have more weeks than the typical marathon plan, maintain around ${mileageRange} miles per week if necessary.`;
}

export function getMaxLongRunDates(
  raceDate: string,
  numMaxLongRuns: number,
): string {
  const raceDateObj = new Date(raceDate);
  const maxLongRunDates = [];

  for (let i = 0; i < numMaxLongRuns; i++) {
    const weeksBeforeRace = (numMaxLongRuns - i) * 2 + 1;
    const maxLongRunDate = new Date(raceDateObj);
    maxLongRunDate.setDate(maxLongRunDate.getDate() - weeksBeforeRace * 7);
    maxLongRunDates.push(maxLongRunDate.toISOString().split('T')[0]);
  }

  return maxLongRunDates.join(', ');
}

export function getHighMileageWeekDate(raceDate: string): string {
  const raceDateObj = new Date(raceDate);
  const highMileageWeekDate = new Date(raceDateObj);
  highMileageWeekDate.setDate(highMileageWeekDate.getDate() - 3 * 7);
  return highMileageWeekDate.toISOString().split('T')[0];
}

export function parseTrainingPlan(jsonString: string): Week[] {
  // Remove any backslashes and newline characters
  const cleanedString = jsonString.replace(/\\n/g, '').replace(/\\/g, '');

  // Parse the cleaned JSON string
  const parsedData = JSON.parse(cleanedString);

  // Map the parsed data to the Week interface
  const trainingPlan: Week[] = parsedData.map((week: any) => ({
    startDate: week.week,
    totalMiles: week.total_miles,
    longRun: week.long_run === 'Marathon' ? 26.2 : week.long_run,
  }));

  return trainingPlan;
}

export function getRaceWeekStartDate(raceDate: string): string {
  const raceDateObj = new Date(raceDate);
  const dayOfWeek = raceDateObj.getDay();
  const daysToSubtract = (dayOfWeek + 6) % 7;

  const raceWeekStartDate = new Date(
    raceDateObj.getFullYear(),
    raceDateObj.getMonth(),
    raceDateObj.getDate() - daysToSubtract,
  );
  return raceWeekStartDate.toISOString().split('T')[0];
}
