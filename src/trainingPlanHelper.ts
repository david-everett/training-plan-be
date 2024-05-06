export interface Week {
  startDate: string;
  totalMiles: number;
}

export interface UserRunningData {
  weeks: Week[];
  // other properties
}

export function getLastFewWeeksMileage(
  userData: UserRunningData,
  numWeeks: number,
): number {
  const sortedWeeks = userData.weeks.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  const recentFullWeeks = sortedWeeks.slice(1, numWeeks + 1); // Exclude the current partial week
  const totalMileage = recentFullWeeks.reduce(
    (sum, week) => sum + week.totalMiles,
    0,
  );
  const averageMileage = totalMileage / numWeeks;
  return Math.round(averageMileage);
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

export function getHoldMileageText(dateString: string): string {
  const raceDate = new Date(dateString);
  const currentDate = new Date();
  const weeksUntilRace = Math.ceil(
    (raceDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24 * 7),
  );

  if (weeksUntilRace > 18) {
    return '- Because we have more weeks than the typical marathon plan, maintain around 30-35 miles per week for a period before increasing further.';
  } else {
    return '';
  }
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
