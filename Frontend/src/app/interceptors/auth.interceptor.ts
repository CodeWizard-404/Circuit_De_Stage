import { HttpInterceptorFn } from '@angular/common/http'; 

// Defines a function that runs for every web request.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // Gets the login token from storage (if it exists).
  const authRoutes = ['/auth/login', '/auth/forgot-password']; // Routes that don’t need the token (like login itself).

  // Checks if there’s a token AND if the request isn’t for login or forgot-password pages.
  if (token && !authRoutes.some(route => req.url.includes(route))) {
    // Makes a copy of the request and adds the token to its headers.
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Adds the token in a format the server expects.
      }
    });
    return next(cloned); // Sends the modified request to the server.
  }
  return next(req); // If no token or it’s an auth route, sends the original request unchanged.
};