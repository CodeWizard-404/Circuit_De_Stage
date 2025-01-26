import { Document } from './document';
import { RoleType } from './enums/role-type';
import { User } from './user';

export class UserDocumentSeen {
    id: number;
    seen: boolean;
    role: RoleType;
    document: Document;
    utilisateur: User;

    constructor(
        id: number,
        seen: boolean,
        role: RoleType,
        document: Document,
        utilisateur: User
    ) {
        this.id = id;
        this.seen = seen;
        this.role = role;
        this.document = document;
        this.utilisateur = utilisateur;
    }
}