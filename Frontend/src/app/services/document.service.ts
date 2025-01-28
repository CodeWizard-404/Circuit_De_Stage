import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../classes/document';
import { DocumentStatus } from '../classes/enums/document-status';
import { DocumentType } from '../classes/enums/document-type';  // Add this import
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

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
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }),
      observe: 'response'
    }).pipe(
      map(response => {
        const contentDisposition = response.headers.get('content-disposition');
        const contentType = response.headers.get('content-type');
        return new Blob([response.body!], { type: contentType || 'application/pdf' });
      })
    );
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