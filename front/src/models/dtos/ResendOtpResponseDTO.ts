interface ResendOtpResponseJSON {
    pendingOtpToken: string
}

export class ResendOtpResponseDTO {
    constructor(
        public readonly pendingOtpToken: string,
    ) {}

    static fromJSON(json: ResendOtpResponseJSON): ResendOtpResponseDTO {
        return new ResendOtpResponseDTO(
            json.pendingOtpToken,
        )
    }
}
