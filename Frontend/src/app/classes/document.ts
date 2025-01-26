import { Demande } from './demande';
import { DocumentStatus } from './enums/document-status';
import { User } from './user';


export class Document {
    id: number;
    name: string;
    type: DocumentType;
    fichier: Blob;
    status: DocumentStatus;
    createdAt: Date;
    demande: Demande;
    centreFormation: User;

    constructor(
        id: number,
        name: string,
        type: DocumentType,
        fichier: Blob,
        status: DocumentStatus,
        createdAt: Date,
        demande: Demande,
        centreFormation: User
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.fichier = fichier;
        this.status = status;
        this.createdAt = createdAt;
        this.demande = demande;
        this.centreFormation = centreFormation;
    }
}