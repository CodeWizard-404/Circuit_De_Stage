import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router'; 
import { RoleType } from '../classes/enums/role-type';
import { AuthService } from '../services/auth.service'; 

@Injectable({ providedIn: 'root' }) // This service is available everywhere in the app.
export class RedirectResolver implements Resolve<void> {
  constructor(private authService: AuthService, private router: Router) {} // Sets up tools to check the user and navigate.

  // Runs when the app starts to figure out where to send the user.
  resolve(): void {
    const currentUser = this.authService.getCurrentUser(); // Gets the current logged-in user (if any).
    const userRole = currentUser?.type; // Finds the user’s role (e.g., supervisor).

    // A list matching roles to their dashboard pages.
    const roleDashboardMap: Record<RoleType, string> = {
      [RoleType.ENCADRANT]: '/encadrant-dashboard', // Supervisor dashboard.
      [RoleType.SERVICE_ADMINISTRATIVE]: '/service-administrative-dashboard', // Admin service dashboard.
      [RoleType.DCRH]: '/dcrh-dashboard', // HR dashboard.
      [RoleType.CENTRE_DE_FORMATION]: '/centre-formation-dashboard', // Training center dashboard.
      [RoleType.STAGIAIRE]: '/stagiaire-dashboard' // Trainee dashboard.
    };

    // Picks the right page: the user’s dashboard if they’re logged in, or a default form if not.
    const dashboardRoute = userRole ? roleDashboardMap[userRole] : '/intern-form';
    this.router.navigate([dashboardRoute]); // Sends the user to that page.
  }
}