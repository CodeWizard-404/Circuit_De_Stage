import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande } from '../classes/demande';
import { DocumentType } from '../classes/enums/document-type';
import { environment } from '../../environments/environment';
import { StageType } from '../classes/enums/stage-type';

@Injectable({ providedIn: 'root' }) // This service is available everywhere in the app.
export class DemandeService {
  constructor(private http: HttpClient) { } // Sets up the tool to make web requests.

  // Sends a new demande (request) to the server with form data (like files or text).
  submitDemande(formData: FormData): Observable<Demande> {
    return this.http.post<Demande>(`${environment.apiUrl}/demande`, formData, {
      headers: {
        'Accept': 'application/json' // Tells the server we want the response in JSON format.
      }
    });
  }

  // Returns a list of required documents based on the type of internship.
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

  // Marks a demande as validated (approved) on the server.
  validateDemande(demandeId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/demande/${demandeId}/validate`, {});
  }

  // Rejects a demande and sends a reason to the server.
  rejectDemande(demandeId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/demande/${demandeId}/reject`, { reason });
  }

  // Gets the list of document types needed for a specific demande from the server.
  getDocumentTypes(demandeId: number): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${environment.apiUrl}/demande/${demandeId}/document-types`);
  }

  // Gets a list of all demandes from the server.
  getAllDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${environment.apiUrl}/demande/ALL`);
  }

  // Gets the details of a specific demande from the server.
  getDemandeDetails(demandeId: number): Observable<Demande> {
    return this.http.get<Demande>(`${environment.apiUrl}/demande/${demandeId}`);
  }
}