import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../classes/enums/role-type';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const requiredRoles = route.data['roles'] as RoleType[];
  return requiredRoles.some(role => authService.hasRole(role));
};