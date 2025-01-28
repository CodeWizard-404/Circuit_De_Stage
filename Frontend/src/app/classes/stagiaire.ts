import { User } from './user';
import { Demande } from './demande';
import { RoleType } from './enums/role-type';

export class Stagiaire extends User {
    emailPerso: string;
    cin: number;
    tel: number;
    institut: string;
    niveau: string;
    annee: string;
    specialite: string;

    emailPerso2?: string;
    nom2?: string;
    prenom2?: string;
    cin2?: number;
    tel2?: number;
    specialite2?: string;

    demandes: Demande[];

    constructor(
        id: number,
        nom: string,
        prenom: string,
        email: string,
        passe: string,
        type: RoleType,
        emailPerso: string,
        cin: number,
        tel: number,
        institut: string,
        niveau: string,
        annee: string,
        specialite: string,
        
        emailPerso2?: string,
        nom2?: string,
        prenom2?: string,
        cin2?: number,
        tel2?: number,
        specialite2?: string
    ) {
        super(id, nom, prenom, email, passe, type);
        this.emailPerso = emailPerso;
        this.cin = cin;
        this.tel = tel;
        this.institut = institut;
        this.niveau = niveau;
        this.annee = annee;
        this.specialite = specialite;
        this.emailPerso2 = emailPerso2;
        this.nom2 = nom2;
        this.prenom2 = prenom2;
        this.cin2 = cin2;
        this.tel2 = tel2;
        this.specialite2 = specialite2;
        this.demandes = [];
    }
}