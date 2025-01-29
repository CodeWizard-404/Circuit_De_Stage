import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../classes/user';
import { Stagiaire } from '../classes/stagiaire';
import { environment } from '../../environments/environment';
import { RoleType } from '../classes/enums/role-type';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | Stagiaire | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<string> {
    const loginData = { email, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${environment.apiUrl}/auth/login`, loginData, { headers, responseType: 'text' })
      .pipe(tap((token: string) => {
        localStorage.setItem('token', token);
        this.fetchCurrentUser().subscribe(() => {
          this.navigateBasedOnRole();
        });
      }));
  }

  private fetchCurrentUser(): Observable<User | Stagiaire> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<User | Stagiaire>(`${environment.apiUrl}/auth/me`, { headers })
      .pipe(tap((user: User | Stagiaire) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }));
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

  navigateBasedOnRole() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/intern-form']);
      return;
    }

    const roleRouteMap: Record<RoleType, string> = {
      [RoleType.ENCADRANT]: '/encadrant-dashboard',
      [RoleType.SERVICE_ADMINISTRATIVE]: '/service-administrative-dashboard',
      [RoleType.DCRH]: '/dcrh-dashboard',
      [RoleType.CENTRE_DE_FORMATION]: '/centre-formation-dashboard',
      [RoleType.STAGIAIRE]: '/stagiaire-dashboard'
    };

    const route = roleRouteMap[currentUser.type];
    if (route) {
      this.router.navigate([route]);
    }
  }
}