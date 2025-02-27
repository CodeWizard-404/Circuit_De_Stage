import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../classes/enums/role-type';

// Defines a guard function that checks if a user has the right role to visit a page.
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService); // Gets the AuthService to check the user.
  const requiredRoles = route.data['roles'] as RoleType[]; // Gets the roles needed for this page from the route settings.
  const currentUser = authService.getCurrentUser(); // Finds out who the current user is (if anyone).

  // If there’s no user logged in, block access.
  if (!currentUser) {
    return false;
  }

  // If the user is a 'STAGIAIRE', block access.
  if (currentUser.type.includes(RoleType.STAGIAIRE)) {
    return false;
  }

  // Check if the user’s role matches any of the required roles for the page.
  return requiredRoles.some(role => currentUser.type.includes(role));
};