import { User, type UserJSON } from "~/models/User";
import { Invitation, type InvitationJSON } from "~/models/Invitation";

export interface ListAgencyCollaboratorsResponseJSON {
    collaborators: UserJSON[];
    pendingInvitations: InvitationJSON[];
}

export class ListAgencyCollaboratorsResponseDTO {
    constructor(
        public readonly collaborators: User[],
        public readonly pendingInvitations: Invitation[],
    ) { }

    static fromJSON(json: ListAgencyCollaboratorsResponseJSON): ListAgencyCollaboratorsResponseDTO {
        return new ListAgencyCollaboratorsResponseDTO(
            json.collaborators.map((collaborator) => User.fromJSON(collaborator)),
            json.pendingInvitations.map((invitation) => Invitation.fromJSON(invitation)),
        );
    }
}
