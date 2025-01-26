import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Demande } from '../classes/demande';
import { DocumentType } from '../classes/enums/document-type';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  constructor(private http: HttpClient) { }

  submitDemande(demande: Demande, documents: Map<DocumentType, File>): Observable<Demande> {
    const formData = new FormData();
    formData.append('demande', JSON.stringify(demande));
    
    documents.forEach((file, type) => {
      formData.append(type.toString(), file);
    });

    return this.http.post<Demande>(`${environment.apiUrl}/demande`, formData);
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
    return this.http.get<Demande[]>(`${environment.apiUrl}/demande`);
  }

  getDemandeDetails(demandeId: number): Observable<Demande> {
    return this.http.get<Demande>(`${environment.apiUrl}/demande/${demandeId}`);
  }
}