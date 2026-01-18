export enum SocialAnalyticsInsightType {
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

export const socialAnalyticsInsightTypeToFrenchTranslation: Record<SocialAnalyticsInsightType, string> = {
    [SocialAnalyticsInsightType.Views]: "Vues",
    [SocialAnalyticsInsightType.Likes]: "J'aime",
    [SocialAnalyticsInsightType.Saves]: "Enregistrements",
    [SocialAnalyticsInsightType.Comments]: "Commentaires",
    [SocialAnalyticsInsightType.Shares]: "Partages",
    [SocialAnalyticsInsightType.Followers]: "Abonnés",
    [SocialAnalyticsInsightType.Impressions]: "Impressions",
    [SocialAnalyticsInsightType.Dislikes]: "Je n'aime pas",
    [SocialAnalyticsInsightType.ProfileLinksTaps]: "Clics liens profil",
    [SocialAnalyticsInsightType.Reach]: "Portée",
    [SocialAnalyticsInsightType.Videos]: "Vidéos",
};
