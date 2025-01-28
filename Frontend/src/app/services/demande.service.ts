import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande } from '../classes/demande';
import { DocumentType } from '../classes/enums/document-type';
import { environment } from '../../environments/environment';
import { StageType } from '../classes/enums/stage-type';
import { DocumentStatus } from '../classes/enums/document-status';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  constructor(private http: HttpClient) { }

  submitDemande(formData: FormData): Observable<Demande> {
    return this.http.post<Demande>(`${environment.apiUrl}/demande`, formData, {
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  getRequiredDocuments(stageType: StageType): DocumentType[] {
    switch(stageType) {
      case StageType.PFE:
      case StageType.PFA:
        return [
          DocumentType.CV,
          DocumentType.LETTRE_DE_MOTIVATION,
          DocumentType.DEMANDE_DE_STAGE
        ];
      case StageType.STAGE_INITIATION:
      case StageType.STAGE_PERFECTIONNEMENT:
        return [
          DocumentType.CV,
          DocumentType.DEMANDE_DE_STAGE
        ];
      default:
        return [];
    }
  }

  validateDemande(demandeId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/demande/${demandeId}/validate`, {});
  }

  rejectDemande(demandeId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/demande/${demandeId}/reject`, { reason });
  }

  getDocumentTypes(demandeId: number): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${environment.apiUrl}/demande/${demandeId}/document-types`);
  }

  getAllDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${environment.apiUrl}/demande/ALL`);
  }

  getDemandeDetails(demandeId: number): Observable<Demande> {
    return this.http.get<Demande>(`${environment.apiUrl}/demande/${demandeId}`);
  }
}