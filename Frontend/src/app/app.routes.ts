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
import { ServiceAdministrativeDashboardComponent } from './components/Users/admin-dashboard/service-administrative-dashboard/service-administrative-dashboard.component';
import { CentreFormationDashboardComponent } from './components/Users/centre-formation-dashboard/centre-formation-dashboard/centre-formation-dashboard.component';
import { DcrhDashboardComponent } from './components/Users/dcrh-dashboard/dcrh-dashboard/dcrh-dashboard.component';
import { EncadrantDashboardComponent } from './components/Users/encadrant-dashboard/encadrant-dashboard/encadrant-dashboard.component';
import { StagiaireDashboardComponent } from './components/Users/stagiaire-dashboard/stagiaire-dashboard/stagiaire-dashboard.component';
import { RedirectResolver } from './resolvers/redirect.resolver';
import { DemandeComponent } from './components/Users/stagiaire-dashboard/demande/demande.component';
import { ConvocationComponent } from './components/Users/stagiaire-dashboard/convocation/convocation.component';
import { DocumentsComponent } from './components/Users/stagiaire-dashboard/documents/documents.component';
import { FinDuStageComponent } from './components/Users/stagiaire-dashboard/fin-du-stage/fin-du-stage.component';

export const routes: Routes = [

  { path: '', resolve: {redirect: RedirectResolver},children: []},

  // Public routes
  { path: 'intern-form', component: InternFormComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Protected routes
  { path: 'intern-list', component: InternListComponent, canActivate: [authGuard, roleGuard], data: { roles: ['SERVICE_ADMINISTRATIVE', 'DCRH', 'ENCADRANT', 'CENTRE_DE_FORMATION'] }  },
  { path: 'demande-view/:id', component: DemandeViewComponent, canActivate: [authGuard, roleGuard], data: { roles: ['SERVICE_ADMINISTRATIVE', 'DCRH', 'ENCADRANT', 'CENTRE_DE_FORMATION'] }  },

  // Users routes
  { path: 'users-admin', component: UsersListComponent, canActivate: [authGuard], data: { role: 'SERVICE_ADMINISTRATIVE' }  },
  { path: 'users-encadrant', component: UsersListComponent, canActivate: [authGuard], data: { role: 'ENCADRANT' }  },
  { path: 'users-dcrh', component: UsersListComponent, canActivate: [authGuard], data: { role: 'DCRH' }  },
  { path: 'users-centre-formation', component: UsersListComponent, canActivate: [authGuard], data: { role: 'CENTRE_DE_FORMATION' }  },
  { path: 'users-add', component: UsersAddComponent, canActivate: [authGuard], data: { role: 'SERVICE_ADMINISTRATIVE' }  },
  { path: 'users-edit/:id', component: UsersManagementComponent, canActivate: [authGuard], data: { role: 'SERVICE_ADMINISTRATIVE' }  },

  // Dashboard
  { path: 'encadrant-dashboard', component: EncadrantDashboardComponent, canActivate: [authGuard], data: { role: 'ENCADRANT' }  },
  { path: 'service-administrative-dashboard', component: ServiceAdministrativeDashboardComponent, canActivate: [authGuard], data: { role: 'SERVICE_ADMINISTRATIVE' }  },
  { path: 'dcrh-dashboard', component: DcrhDashboardComponent, canActivate: [authGuard], data: { role: 'DCRH' }  },
  { path: 'centre-formation-dashboard', component: CentreFormationDashboardComponent, canActivate: [authGuard], data: { role: 'CENTRE_DE_FORMATION' }  },
  
  // Stagiaire routes
  { path: 'stagiaire-dashboard', component: StagiaireDashboardComponent, canActivate: [authGuard], data: { role: 'STAGIAIRE' }  },
  { path: 'demande', component: DemandeComponent, canActivate: [authGuard], data: { role: 'STAGIAIRE' }  },
  { path: 'convocation', component: ConvocationComponent, canActivate: [authGuard], data: { role: 'STAGIAIRE' }  },
  { path: 'document', component: DocumentsComponent, canActivate: [authGuard], data: { role: 'STAGIAIRE' }  },
  { path: 'fin-du-stage', component: FinDuStageComponent, canActivate: [authGuard], data: { role: 'STAGIAIRE' }  },

  // Route for 404
  { path: '**', component: ErrorComponent },
];

