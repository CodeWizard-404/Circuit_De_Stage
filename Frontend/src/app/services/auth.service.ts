import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../classes/user';
import { Stagiaire } from '../classes/stagiaire';
import { environment } from '../../environments/environment';
import { RoleType } from '../classes/enums/role-type';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | Stagiaire | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        this.fetchUserDetails(email);
      }));
  }

  private fetchUserDetails(email: string): void {
    this.http.get<User | Stagiaire>(`${environment.apiUrl}/users/email/${email}`)
      .subscribe(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  getCurrentUser(): User | Stagiaire | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(requiredRole: RoleType): boolean {
    const user = this.getCurrentUser();
    return user?.type === requiredRole;
  }
}