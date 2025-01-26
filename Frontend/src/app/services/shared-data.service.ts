import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Demande } from '../classes/demande';
import { Document } from '../classes/document';

@Injectable({ providedIn: 'root' })
export class SharedDataService {
  private selectedDemandeSource = new ReplaySubject<Demande>(1);
  private selectedDocumentSource = new ReplaySubject<Document>(1);
  
  selectedDemande$ = this.selectedDemandeSource.asObservable();
  selectedDocument$ = this.selectedDocumentSource.asObservable();

  setSelectedDemande(demande: Demande): void {
    this.selectedDemandeSource.next(demande);
  }

  setSelectedDocument(document: Document): void {
    this.selectedDocumentSource.next(document);
  }
}