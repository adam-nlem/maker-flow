interface LoginResponseJSON {
    requiresOtp: boolean
    requiresEmailVerification: boolean
    pendingOtpToken: string
    email: string | null
}

export class LoginResponseDTO {
    constructor(
        public readonly requiresOtp: boolean,
        public readonly requiresEmailVerification: boolean,
        public readonly pendingOtpToken: string,
        public readonly email: string | null,
    ) {}

    static fromJSON(json: LoginResponseJSON): LoginResponseDTO {
        return new LoginResponseDTO(
            json.requiresOtp,
            json.requiresEmailVerification,
            json.pendingOtpToken,
            json.email,
        )
    }
}
