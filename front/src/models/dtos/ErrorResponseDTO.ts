interface ErrorResponseJSON {
    code: number
    httpStatus: number
    meta?: Record<string, unknown>
}

export class ErrorResponseDTO {
    constructor(
        public readonly code: number,
        public readonly httpStatus: number,
        public readonly meta: Record<string, unknown>,
    ) {}

    static fromJSON(json: ErrorResponseJSON): ErrorResponseDTO {
        return new ErrorResponseDTO(json.code, json.httpStatus, json.meta ?? {})
    }

    static tryFrom(data: unknown): ErrorResponseDTO | null {
        if (
            data
            && typeof data === 'object'
            && 'code' in data
            && typeof (data as Record<string, unknown>).code === 'number'
        ) {
            return ErrorResponseDTO.fromJSON(data as ErrorResponseJSON)
        }

        return null
    }
}
