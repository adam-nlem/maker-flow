export function getWidthClassFromPercentage(value: number) {
  if (value >= 100) return 'w-full';
  if (value >= 75) return 'w-3/4';
  if (value >= 66) return 'w-2/3';
  if (value >= 50) return 'w-1/2';
  if (value >= 33) return 'w-1/3';
  if (value >= 25) return 'w-1/4';
  if (value > 0) return 'w-1/12';
  return 'w-0';
};


