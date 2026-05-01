export enum OtpType {
    Login = 'login',
    EmailVerification = 'email_verification',
    PrelaunchVerification = 'prelaunch_verification',
}

export const otpTypeTranslationKeys: Record<OtpType, string> = {
    [OtpType.Login]: "enums:otpType.login",
    [OtpType.EmailVerification]: "enums:otpType.emailVerification",
    [OtpType.PrelaunchVerification]: "enums:otpType.prelaunchVerification",
}

export const otpTypeToEndpoint: Record<OtpType, string> = {
    [OtpType.Login]: '/otp/verify-login',
    [OtpType.EmailVerification]: '/otp/verify-email',
    [OtpType.PrelaunchVerification]: '/otp/verify-prelaunch',
}
