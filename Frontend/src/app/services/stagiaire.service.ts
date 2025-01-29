import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stagiaire } from '../classes/stagiaire';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StagiaireService {
  constructor(private http: HttpClient) { }

  // getStagiaireInfo(stagiaireId: number): Observable<Stagiaire> {
  //   return this.http.get<Stagiaire>(`${environment.apiUrl}/stagiaires/${stagiaireId}`);
  // }

  // getAllStagiaires(): Observable<Stagiaire[]> {
  //   return this.http.get<Stagiaire[]>(`${environment.apiUrl}/stagiaires`);
  // }

  deactivateAccount(stagiaireId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/stagiaires/${stagiaireId}/deactivate`);
  }
}