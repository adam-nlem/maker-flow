export enum OtpType {
    Login = 'login',
    EmailVerification = 'email_verification',
    PrelaunchVerification = 'prelaunch_verification',
}

export const otpTypeToFrenchTranslation: Record<OtpType, string> = {
    [OtpType.Login]: "Vérification de connexion",
    [OtpType.EmailVerification]: "Vérification de votre email",
    [OtpType.PrelaunchVerification]: "Vérification de votre inscription",
}

export const otpTypeToEndpoint: Record<OtpType, string> = {
    [OtpType.Login]: '/otp/verify-login',
    [OtpType.EmailVerification]: '/otp/verify-email',
    [OtpType.PrelaunchVerification]: '/otp/verify-prelaunch',
}
