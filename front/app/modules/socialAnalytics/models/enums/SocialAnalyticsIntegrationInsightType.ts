export enum SocialAnalyticsIntegrationInsightType {
    Views = 'views',
    Likes = 'likes',
    Saves = 'saves',
    Comments = 'comments',
    Shares = 'shares',
    Followers = 'followers',
    Impressions = 'impressions',
    Dislikes = 'dislikes',
    ProfileLinksTaps = 'profile_links_taps',
    Reach = 'reach',
    Videos = 'videos',
}

export const socialAnalyticsIntegrationInsightTypeToFrenchTranslation: Record<SocialAnalyticsIntegrationInsightType, string> = {
    [SocialAnalyticsIntegrationInsightType.Views]: "Vues",
    [SocialAnalyticsIntegrationInsightType.Likes]: "J'aime",
    [SocialAnalyticsIntegrationInsightType.Saves]: "Enregistrements",
    [SocialAnalyticsIntegrationInsightType.Comments]: "Commentaires",
    [SocialAnalyticsIntegrationInsightType.Shares]: "Partages",
    [SocialAnalyticsIntegrationInsightType.Followers]: "Abonnés",
    [SocialAnalyticsIntegrationInsightType.Impressions]: "Impressions",
    [SocialAnalyticsIntegrationInsightType.Dislikes]: "Je n'aime pas",
    [SocialAnalyticsIntegrationInsightType.ProfileLinksTaps]: "Clics liens profil",
    [SocialAnalyticsIntegrationInsightType.Reach]: "Portée",
    [SocialAnalyticsIntegrationInsightType.Videos]: "Vidéos",
};
