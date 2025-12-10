import type { User } from '../User';

export interface AuthResponseDTO {
    token: string;
    user: User;
}