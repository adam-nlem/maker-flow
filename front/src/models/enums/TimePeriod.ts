export enum TimePeriod {
    Last7Days = 'last_7_days',
    Last30Days = 'last_30_days',
    Last90Days = 'last_90_days',
    LastYear = 'last_year',
}

export const timePeriodTranslationKeys: Record<TimePeriod, string> = {
    [TimePeriod.Last7Days]: "enums:timePeriod.last7Days",
    [TimePeriod.Last30Days]: "enums:timePeriod.last30Days",
    [TimePeriod.Last90Days]: "enums:timePeriod.last90Days",
    [TimePeriod.LastYear]: "enums:timePeriod.lastYear",
};

export const timePeriodOptions = Object.values(TimePeriod)

export const timePeriodToDays: Record<TimePeriod, number> = {
    [TimePeriod.Last7Days]: 7,
    [TimePeriod.Last30Days]: 30,
    [TimePeriod.Last90Days]: 90,
    [TimePeriod.LastYear]: 365,
};