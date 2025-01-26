import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    /*{
        path: 'admin',
        loadComponent: () => import('./components/dashboards/admin-dashboard/dashboard.component'),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SERVICE_ADMINISTRATIVE'] }
    },*/
    // ... other routes
];