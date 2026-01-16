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
