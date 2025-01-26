import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../classes/document';
import { DocumentStatus } from '../classes/enums/document-status';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(private http: HttpClient) { }

  uploadDocument(demandeId: number, file: File, type: DocumentType): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Document>(`${environment.apiUrl}/document/upload/${demandeId}?type=${type}`, formData);
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/document/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  validateDocument(documentId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/document/${documentId}/validate`, {});
  }

  rejectDocument(documentId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/document/${documentId}/reject`, { reason });
  }

  markAsSeen(documentId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/document/${documentId}/seen`, {});
  }

  getDocumentStatus(documentId: number): Observable<DocumentStatus> {
    return this.http.get<DocumentStatus>(`${environment.apiUrl}/document/${documentId}/status`);
  }
}