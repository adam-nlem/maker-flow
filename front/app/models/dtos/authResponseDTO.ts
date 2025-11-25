import type { User } from '../user';

export interface AuthResponseDTO {
    token: string;
    user: User;
}