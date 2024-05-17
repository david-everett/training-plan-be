export function checkFirstWeekDate(
  plan: any,
  expectedStartDate: string,
): boolean {
  if (!Array.isArray(plan) || plan.length === 0) {
    console.error('Training plan is empty or not an array');
    return false;
  }
  const firstWeekDate = plan[0]?.week;
  return firstWeekDate === expectedStartDate;
}

export function checkMaxLongRun(plan: any, longRun: number): boolean {
  if (!Array.isArray(plan) || plan.length === 0) {
    console.error('Training plan is empty or not an array');
    return false;
  }
  const longRunValues = plan
    .map((week: any) => week?.long_run)
    .filter((value: any) => typeof value === 'number');
  const maxLongRun = Math.max(...longRunValues);
  return maxLongRun <= longRun;
}
