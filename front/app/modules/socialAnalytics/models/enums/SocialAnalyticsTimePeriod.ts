export enum SocialAnalyticsTimePeriod {
    Last7Days = 'last_7_days',
    Last30Days = 'last_30_days',
    Last90Days = 'last_90_days',
    LastYear = 'last_year',
}

export const socialAnalyticsTimePeriodToFrenchTranslation: Record<SocialAnalyticsTimePeriod, string> = {
    [SocialAnalyticsTimePeriod.Last7Days]: "Ces 7 derniers jours",
    [SocialAnalyticsTimePeriod.Last30Days]: "Ce dernier mois",
    [SocialAnalyticsTimePeriod.Last90Days]: "Ces 3 derniers mois",
    [SocialAnalyticsTimePeriod.LastYear]: "Cette dernière année",
};

export const socialAnalyticsTimePeriodOptions = Object.values(SocialAnalyticsTimePeriod)

export const socialAnalyticsTimePeriodToDays: Record<SocialAnalyticsTimePeriod, number> = {
    [SocialAnalyticsTimePeriod.Last7Days]: 7,
    [SocialAnalyticsTimePeriod.Last30Days]: 30,
    [SocialAnalyticsTimePeriod.Last90Days]: 90,
    [SocialAnalyticsTimePeriod.LastYear]: 365,
};