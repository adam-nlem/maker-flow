import { ErrorResponseDTO } from '~/models/dtos/ErrorResponseDTO'

export class HttpException extends Error {
    public readonly response: ErrorResponseDTO

    constructor(httpStatus: number, data?: unknown) {
        super(`HTTP ${httpStatus}`)
        this.response = ErrorResponseDTO.tryFrom(data) ?? new ErrorResponseDTO(99999, httpStatus, {})
    }
}
