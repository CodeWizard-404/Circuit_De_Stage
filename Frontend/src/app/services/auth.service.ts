import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Observable, BehaviorSubject } from 'rxjs'; 
import { tap } from 'rxjs/operators';
import { User } from '../classes/user'; 
import { Stagiaire } from '../classes/stagiaire'; 
import { environment } from '../../environments/environment'; 
import { RoleType } from '../classes/enums/role-type'; 
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' }) // This service is available everywhere in the app.
export class AuthService {
  // Keeps track of the current user and lets other parts of the app watch for changes.
  private currentUserSubject = new BehaviorSubject<User | Stagiaire | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeCurrentUser(); // Checks if a user is already logged in when the app starts.
  }

  // Sets up the current user from saved data (if any).
  private initializeCurrentUser(): void {
    const token = localStorage.getItem('token'); // Gets the login token from storage.
    if (token) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}'); // Loads the saved user.
      this.currentUserSubject.next(user); // Updates the current user.
    }
  }

  // Logs in a user with their email and password.
  login(email: string, password: string): Observable<string> {
    const loginData = { email, password }; // Packs the email and password together.
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // Sets up the request format.
    return this.http.post(`${environment.apiUrl}/auth/login`, loginData, { headers, responseType: 'text' })
      .pipe(tap((token: string) => { // After login, saves the token and gets user info.
        localStorage.setItem('token', token); // Saves the token.
        this.fetchCurrentUser().subscribe(() => { // Fetches user details.
          this.navigateBasedOnRole(); // Sends the user to the right page based on their role.
        });
      }));
  }

  // Gets the current user's details from the server.
  private fetchCurrentUser(): Observable<User | Stagiaire> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Uses the token to prove identity.
    });
    return this.http.get<User | Stagiaire>(`${environment.apiUrl}/auth/me`, { headers })
      .pipe(tap((user: User | Stagiaire) => { // Saves the user and updates the app.
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }));
  }

  // Logs the user out.
  logout(): void {
    localStorage.removeItem('token'); // Deletes the token.
    localStorage.removeItem('currentUser'); // Deletes the user info.
    this.currentUserSubject.next(null); // Clears the current user.
  }

  // Sends a "forgot password" request to the server.
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  // Returns the current user (if any).
  getCurrentUser(): User | Stagiaire | null {
    return this.currentUserSubject.value;
  }

  // Checks if a user is logged in.
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // True if there’s a token, false if not.
  }

  // Checks if the user has a specific role.
  hasRole(requiredRole: RoleType): boolean {
    const user = this.getCurrentUser();
    return user?.type === requiredRole; // True if the user’s role matches the required one.
  }

  // Sends the user to a page based on their role.
  navigateBasedOnRole() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/intern-form']); // If no user, go to a default page.
      return;
    }

    // A list of roles and their matching pages.
    const roleRouteMap: Record<RoleType, string> = {
      [RoleType.ENCADRANT]: '/encadrant-dashboard',
      [RoleType.SERVICE_ADMINISTRATIVE]: '/service-administrative-dashboard',
      [RoleType.DCRH]: '/dcrh-dashboard',
      [RoleType.CENTRE_DE_FORMATION]: '/centre-formation-dashboard',
      [RoleType.STAGIAIRE]: '/stagiaire-dashboard'
    };

    const route = roleRouteMap[currentUser.type]; // Finds the right page for the user’s role.
    if (route) {
      this.router.navigate([route]); // Takes the user to that page.
    }
  }
}