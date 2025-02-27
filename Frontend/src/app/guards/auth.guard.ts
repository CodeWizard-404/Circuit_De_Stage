import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Marks this as a service available everywhere in the app.
@Injectable({ providedIn: 'root' })
export class authGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {} // Sets up tools to check login status and redirect.

  // Decides if a user can visit a page (runs before the page loads).
  canActivate(): boolean {
    const isAuthenticated = this.authService.isLoggedIn(); // Asks the AuthService if the user is logged in.
    if (!isAuthenticated) { // If the user isn’t logged in...
      this.router.navigate(['/login']); // Sends them to the login page.
    }
    return isAuthenticated; // Returns true (allow access) if logged in, false (block access) if not.
  }
}