import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { ConfirmationComponent } from './components/Public/confirmation/confirmation.component';
import { ForgotPasswordComponent } from './components/Public/forgot-password/forgot-password.component';
import { InternFormComponent } from './components/Public/intern-form/intern-form.component';
import { LoginComponent } from './components/Public/login/login.component';
import { InternListComponent } from './components/shared/intern-list/intern-list.component';
import { DemandeViewComponent } from './components/shared/demande-view/demande-view.component';

export const routes: Routes = [
    { path: '', component: InternFormComponent },
    { path: 'confirmation', component: ConfirmationComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'intern-list', component: InternListComponent},
    { path: 'demande-view/:id', component: DemandeViewComponent },

    /*{
        path: 'admin',
        loadComponent: () => import('./components/dashboards/admin-dashboard/dashboard.component'),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SERVICE_ADMINISTRATIVE'] }
    },*/
    // ... other routes
];