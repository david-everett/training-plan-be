export function checkFirstWeekDate(
  plan: any,
  expectedStartDate: string,
): boolean {
  console.log(`plan is`, plan);
  if (!Array.isArray(plan) || plan.length === 0) {
    console.error('Training plan is empty or not an array');
    return false;
  }
  const firstWeekDate = plan[0]?.week;
  console.log(`First week: ${firstWeekDate}`);
  console.log(`Expected week: ${expectedStartDate}`);
  const result = firstWeekDate === expectedStartDate;
  console.log(`First week date check: ${result}`);
  return result;
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
  console.log(`Max long run: ${maxLongRun}`);
  console.log(`Long Run: ${longRun}`);
  const result = maxLongRun <= longRun;
  console.log(`Max long run check: ${result}`);
  return result;
}
