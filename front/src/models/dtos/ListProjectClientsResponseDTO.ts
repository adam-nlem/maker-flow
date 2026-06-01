import { User, type UserJSON } from "~/models/User";
import { Invitation, type InvitationJSON } from "~/models/Invitation";

export interface ListProjectClientsResponseJSON {
    clients: UserJSON[];
    pendingInvitations: InvitationJSON[];
}

export class ListProjectClientsResponseDTO {
    constructor(
        public readonly clients: User[],
        public readonly pendingInvitations: Invitation[],
    ) { }

    static fromJSON(json: ListProjectClientsResponseJSON): ListProjectClientsResponseDTO {
        return new ListProjectClientsResponseDTO(
            json.clients.map((client) => User.fromJSON(client)),
            json.pendingInvitations.map((invitation) => Invitation.fromJSON(invitation)),
        );
    }
}
