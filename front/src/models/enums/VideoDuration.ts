export enum VideoDuration {
    ThirtySeconds = '30_seconds',
    OneMinute = '1_minute',
    OneMinuteThirty = '1_minute_30',
    TwoMinutes = '2_minutes',
    FiveToTenMinutes = '5_to_10_minutes',
    TenToTwentyMinutes = '10_to_20_minutes',
    TwentyPlusMinutes = '20_plus_minutes',
}

export const videoDurationTranslationKeys: Record<VideoDuration, string> = {
    [VideoDuration.ThirtySeconds]: "enums:videoDuration.thirtySeconds",
    [VideoDuration.OneMinute]: "enums:videoDuration.oneMinute",
    [VideoDuration.OneMinuteThirty]: "enums:videoDuration.oneMinuteThirty",
    [VideoDuration.TwoMinutes]: "enums:videoDuration.twoMinutes",
    [VideoDuration.FiveToTenMinutes]: "enums:videoDuration.fiveToTenMinutes",
    [VideoDuration.TenToTwentyMinutes]: "enums:videoDuration.tenToTwentyMinutes",
    [VideoDuration.TwentyPlusMinutes]: "enums:videoDuration.twentyPlusMinutes",
}

export const videoDurationOptions = Object.values(VideoDuration);
