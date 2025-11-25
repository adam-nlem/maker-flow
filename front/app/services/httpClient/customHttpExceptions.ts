export class CustomHttpException {
    constructor(
        public statusCode: number,
        public errorMessage: string,
        public data?: any,
    ) { }
}

export class BadRequestException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(400, message, data)
    }
}

export class UnauthorizedException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(401, message, data);
    }
}

export class ForbiddenException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(403, message, data);
    }
}

export class NotFoundException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(404, message, data);
    }
}

export class TimeoutException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(408, message, data);
    }
}

export class ConflictException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(409, message, data);
    }
}

export class InternalServerException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(500, message, data);
    }
}
