interface RegisterResponseJSON {
    requiresEmailVerification: boolean
    pendingOtpToken: string
    email: string
}

export class RegisterResponseDTO {
    constructor(
        public readonly requiresEmailVerification: boolean,
        public readonly pendingOtpToken: string,
        public readonly email: string,
    ) {}

    static fromJSON(json: RegisterResponseJSON): RegisterResponseDTO {
        return new RegisterResponseDTO(
            json.requiresEmailVerification,
            json.pendingOtpToken,
            json.email,
        )
    }
}
