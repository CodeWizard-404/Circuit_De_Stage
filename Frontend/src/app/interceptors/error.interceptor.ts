import { HttpInterceptorFn } from '@angular/common/http'; 
import { inject } from '@angular/core'; 
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs'; 

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Gets the Router tool to redirect users if needed.

  // Sends the request and watches for errors.
  return next(req).pipe(
    catchError(error => { // If an error happens, this runs.
      if (error.status === 401) { // Checks if the error is "401" (unauthorized, e.g., not logged in).
        router.navigate(['/login']); // Sends the user to the login page.
      }
      return throwError(() => error); // Passes the error along so the app can handle it further.
    })
  );
};