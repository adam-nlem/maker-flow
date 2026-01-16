import { User } from '../User';

interface AuthResponseJSON {
    token: string;
    user: any;
}

export class AuthResponseDTO {
    constructor(
        public readonly token: string,
        public readonly user: User,
    ) {}

    static fromJSON(json: AuthResponseJSON): AuthResponseDTO {
        return new AuthResponseDTO(
            json.token,
            User.fromJSON(json.user),
        );
    }
}