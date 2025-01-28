import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { ConfirmationComponent } from './components/Public/confirmation/confirmation.component';
import { ForgotPasswordComponent } from './components/Public/forgot-password/forgot-password.component';
import { InternFormComponent } from './components/Public/intern-form/intern-form.component';
import { LoginComponent } from './components/Public/login/login.component';
import { InternListComponent } from './components/shared/intern-list/intern-list.component';
import { DemandeViewComponent } from './components/shared/demande-view/demande-view.component';
import { UsersAddComponent } from './components/Users/admin-dashboard/users-add/users-add.component';
import { UsersListComponent } from './components/Users/admin-dashboard/users-list/users-list.component';
import { UsersManagementComponent } from './components/Users/admin-dashboard/users-management/users-management.component';
import { ErrorComponent } from './components/error/error.component';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    resolve: {
      redirect: 'redirectResolver'
    }
  },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Protected routes
  { path: 'intern-list', component: InternListComponent, canActivate: [authGuard]  },
  { path: 'demande-view/:id', component: DemandeViewComponent, canActivate: [authGuard]  },

  // Role-protected routes
  { path: 'users-admin', component: UsersListComponent, canActivate: [authGuard],data: { role: 'SERVICE_ADMINISTRATIVE' }  },
  { path: 'users-encadrant', component: UsersListComponent, canActivate: [authGuard],data: { role: 'ENCADRANT' }  },
  { path: 'users-dcrh', component: UsersListComponent, canActivate: [authGuard],data: { role: 'DCRH' }  },
  { path: 'users-centre-formation', component: UsersListComponent, canActivate: [authGuard],data: { role: 'CENTRE_DE_FORMATION' }  },
  { path: 'users-add', component: UsersAddComponent, canActivate: [authGuard, roleGuard],data: { role: 'SERVICE_ADMINISTRATIVE' }  },
  { path: 'users-edit/:id', component: UsersManagementComponent, canActivate: [authGuard, roleGuard],data: { role: 'SERVICE_ADMINISTRATIVE' }  },

  { path: 'encadrant-dashboard', component: EncadrantDashboardComponent, canActivate: [authGuard],data: { role: 'ENCADRANT' }  },
  { path: 'service-administrative-dashboard', component: ServiceAdministrativeDashboardComponent, canActivate: [authGuard],data: { role: 'SERVICE_ADMINISTRATIVE' }  },
  { path: 'dcrh-dashboard', component: DcrhDashboardComponent, canActivate: [authGuard],data: { role: 'DCRH' }  },
  { path: 'centre-formation-dashboard', component: CentreFormationDashboardComponent, canActivate: [authGuard],data: { role: 'CENTRE_DE_FORMATION' }  },
  
  { path: 'stagiaire-dashboard', component: StagiaireDashboardComponent, canActivate: [authGuard],data: { role: 'STAGIAIRE' }  },
  
  
  
  // Wildcard route for 404
  { path: '**', component: ErrorComponent },
];

// Add a resolver to handle the redirection based on user role
import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { RoleType } from './classes/enums/role-type';
import { EncadrantDashboardComponent } from './components/Users/encadrant-dashboard/encadrant-dashboard/encadrant-dashboard.component';
import { ServiceAdministrativeDashboardComponent } from './components/Users/admin-dashboard/service-administrative-dashboard/service-administrative-dashboard.component';
import { DcrhDashboardComponent } from './components/Users/dcrh-dashboard/dcrh-dashboard/dcrh-dashboard.component';
import { CentreFormationDashboardComponent } from './components/Users/centre-formation-dashboard/centre-formation-dashboard/centre-formation-dashboard.component';
import { StagiaireDashboardComponent } from './components/Users/stagiaire-dashboard/stagiaire-dashboard/stagiaire-dashboard.component';

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

    const dashboardRoute = userRole ? roleDashboardMap[userRole] : '/';
    this.router.navigate([dashboardRoute]);
  }
}
