import { RoleType } from "./enums/role-type";

export class User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    passe: string;
    type: RoleType;

    constructor(
        id: number,
        nom: string,
        prenom: string,
        email: string,
        passe: string,
        type: RoleType
    ) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.passe = passe;
        this.type = type;
    }
}