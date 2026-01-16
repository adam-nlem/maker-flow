export enum SocialAnalyticsMetric {
    Views = 'views',
    Likes = 'likes',
    Saves = 'saves',
    Comments = 'comments',
    Followers = 'followers',
}

export const socialAnalyticsMetricToFrenchTranslation: Record<SocialAnalyticsMetric, string> = {
    [SocialAnalyticsMetric.Views]: "Vues",
    [SocialAnalyticsMetric.Likes]: "J'aime",
    [SocialAnalyticsMetric.Saves]: "Enregistrements",
    [SocialAnalyticsMetric.Comments]: "Commentaires",
    [SocialAnalyticsMetric.Followers]: "Abonnés",
};
