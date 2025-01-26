import { Stagiaire } from './stagiaire';
import { User } from './user';
import { Document } from './document';
import { DemandeStatus } from './enums/demande-status';
import { StageType } from './enums/stage-type';

export class Demande {
    id: number;
    stage: StageType;
    debutStage: Date;
    finStage: Date;
    status: DemandeStatus;
    stagiaire: Stagiaire;
    encadrant: User;
    documents: Document[];

    constructor(
        id: number,
        stage: StageType,
        debutStage: Date,
        finStage: Date,
        status: DemandeStatus,
        stagiaire: Stagiaire,
        encadrant: User,
        documents: Document[] = []
    ) {
        this.id = id;
        this.stage = stage;
        this.debutStage = debutStage;
        this.finStage = finStage;
        this.status = status;
        this.stagiaire = stagiaire;
        this.encadrant = encadrant;
        this.documents = documents;
    }
}