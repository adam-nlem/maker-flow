export enum OtpType {
    Login = 'login',
    EmailVerification = 'email_verification',
}

export const otpTypeToFrenchTranslation: Record<OtpType, string> = {
    [OtpType.Login]: "Vérification de connexion",
    [OtpType.EmailVerification]: "Vérification de votre email",
}

export const otpTypeToEndpoint: Record<OtpType, string> = {
    [OtpType.Login]: '/otp/verify-login',
    [OtpType.EmailVerification]: '/otp/verify-email',
}
