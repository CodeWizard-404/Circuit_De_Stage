import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { RoleType } from '../classes/enums/role-type';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RedirectResolver implements Resolve<void> {
  constructor(private authService: AuthService, private router: Router) {}

  resolve(): void {
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.type;

    const roleDashboardMap: Record<RoleType, string> = {
      [RoleType.ENCADRANT]: '/encadrant-dashboard',
      [RoleType.SERVICE_ADMINISTRATIVE]: '/service-administrative-dashboard',
      [RoleType.DCRH]: '/dcrh-dashboard',
      [RoleType.CENTRE_DE_FORMATION]: '/centre-formation-dashboard',
      [RoleType.STAGIAIRE]: '/stagiaire-dashboard'
    };

    const dashboardRoute = userRole ? roleDashboardMap[userRole] : '/intern-form';
    this.router.navigate([dashboardRoute]);
  }
}
