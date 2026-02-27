export enum VideoDuration {
    ThirtySeconds = '30_seconds',
    OneMinute = '1_minute',
    OneMinuteThirty = '1_minute_30',
    TwoMinutes = '2_minutes',
    FiveToTenMinutes = '5_to_10_minutes',
    TenToTwentyMinutes = '10_to_20_minutes',
    TwentyPlusMinutes = '20_plus_minutes',
}

export const videoDurationToFrenchTranslation: Record<VideoDuration, string> = {
    [VideoDuration.ThirtySeconds]: "30 secondes",
    [VideoDuration.OneMinute]: "1 minute",
    [VideoDuration.OneMinuteThirty]: "1 min 30",
    [VideoDuration.TwoMinutes]: "2 minutes",
    [VideoDuration.FiveToTenMinutes]: "5-10 minutes",
    [VideoDuration.TenToTwentyMinutes]: "10-20 minutes",
    [VideoDuration.TwentyPlusMinutes]: "20+ minutes",
}

export const videoDurationOptions = Object.values(VideoDuration);
