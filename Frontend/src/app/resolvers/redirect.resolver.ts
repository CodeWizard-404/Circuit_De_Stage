import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../classes/enums/role-type';

@Injectable({ providedIn: 'root' })
export class RedirectResolver implements Resolve<void> {
  constructor(private authService: AuthService, private router: Router) {}

  resolve(): void {
    console.log('RedirectResolver: Resolving user role');
    const currentUser = this.authService.getCurrentUser();
    console.log('RedirectResolver: currentUser =', currentUser);
    const userRole = currentUser?.type;
    console.log('RedirectResolver: userRole =', userRole);

    const roleDashboardMap: Record<RoleType, string> = {
      [RoleType.ENCADRANT]: '/encadrant-dashboard',
      [RoleType.SERVICE_ADMINISTRATIVE]: '/service-administrative-dashboard',
      [RoleType.DCRH]: '/dcrh-dashboard',
      [RoleType.CENTRE_DE_FORMATION]: '/centre-formation-dashboard',
      [RoleType.STAGIAIRE]: '/stagiaire-dashboard'
    };

    const dashboardRoute = userRole ? roleDashboardMap[userRole] : '/';
    console.log('RedirectResolver: Navigating to', dashboardRoute);
    this.router.navigate([dashboardRoute]);
  }
}
