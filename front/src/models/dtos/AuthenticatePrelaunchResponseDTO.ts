interface AuthenticatePrelaunchResponseJSON {
    pendingOtpToken: string
    email: string
}

export class AuthenticatePrelaunchResponseDTO {
    constructor(
        public readonly pendingOtpToken: string,
        public readonly email: string,
    ) {}

    static fromJSON(json: AuthenticatePrelaunchResponseJSON): AuthenticatePrelaunchResponseDTO {
        return new AuthenticatePrelaunchResponseDTO(
            json.pendingOtpToken,
            json.email,
        )
    }
}
