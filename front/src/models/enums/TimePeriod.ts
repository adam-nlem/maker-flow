export enum TimePeriod {
    Last7Days = 'last_7_days',
    Last30Days = 'last_30_days',
    Last90Days = 'last_90_days',
    LastYear = 'last_year',
}

export const timePeriodToFrenchTranslation: Record<TimePeriod, string> = {
    [TimePeriod.Last7Days]: "Ces 7 derniers jours",
    [TimePeriod.Last30Days]: "Ce dernier mois",
    [TimePeriod.Last90Days]: "Ces 3 derniers mois",
    [TimePeriod.LastYear]: "Cette dernière année",
};

export const timePeriodOptions = Object.values(TimePeriod)

export const timePeriodToDays: Record<TimePeriod, number> = {
    [TimePeriod.Last7Days]: 7,
    [TimePeriod.Last30Days]: 30,
    [TimePeriod.Last90Days]: 90,
    [TimePeriod.LastYear]: 365,
};