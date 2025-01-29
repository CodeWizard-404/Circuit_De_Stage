import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../classes/enums/role-type';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const requiredRoles = route.data['roles'] as RoleType[];
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    return false;
  }

  // Check if the user is not a 'STAGIAIRE'
  if (currentUser.type.includes(RoleType.STAGIAIRE)) {
    return false;
  }

  return requiredRoles.some(role => currentUser.type.includes(role));
};