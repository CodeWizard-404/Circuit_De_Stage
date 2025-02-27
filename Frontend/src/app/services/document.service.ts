import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { Document } from '../classes/document'; 
import { DocumentStatus } from '../classes/enums/document-status'; 
import { DocumentType } from '../classes/enums/document-type'; 
import { environment } from '../../environments/environment'; 
import { map } from 'rxjs/operators'; 

@Injectable({ providedIn: 'root' }) // This service is available everywhere in the app.
export class DocumentService {
  constructor(private http: HttpClient) { } // Sets up the tool for making web requests.

  // Uploads a file (like a CV) linked to a specific request and its document type.
  uploadDocument(demandeId: number, file: File, type: DocumentType): Observable<Document> {
    const formData = new FormData(); // Packs the file into a format the server can handle.
    formData.append('file', file);
    return this.http.post<Document>(`${environment.apiUrl}/document/upload/${demandeId}?type=${type}`, formData);
  }

  // Downloads a document from the server as a file (e.g., PDF or Word doc).
  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/document/${documentId}/download`, {
      responseType: 'blob', // Tells the server we want a raw file, not text.
      headers: new HttpHeaders({
        'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        // Says we can handle PDFs or Word files.
      }),
      observe: 'response' // Lets us see the full server response, including headers.
    }).pipe(
      map(response => {
        const contentType = response.headers.get('content-type'); // Tells the file type (e.g., PDF).
        return new Blob([response.body!], { type: contentType || 'application/pdf' }); // Wraps the file for download.
      })
    );
  }

  // Marks a document as validated on the server.
  validateDocument(documentId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/document/${documentId}/validate`, {});
  }

  // Rejects a document and sends a reason to the server.
  rejectDocument(documentId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/document/${documentId}/reject`, { reason });
  }


  // Gets the current status of a document (e.g., validated, rejected) from the server.
  getDocumentStatus(documentId: number): Observable<DocumentStatus> {
    return this.http.get<DocumentStatus>(`${environment.apiUrl}/document/${documentId}/status`);
  }
}