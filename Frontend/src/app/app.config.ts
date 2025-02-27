import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { provideToastr } from 'ngx-toastr';

// Define the application configuration
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zone change detection with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide routing functionality using the defined routes
    provideRouter(routes),

    // Provide a native date adapter for Angular Material date components
    provideNativeDateAdapter(),

    // Configure the HTTP client with interceptors for authentication and error handling
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]) // Add interceptors to handle authentication and errors globally
    ),

    // Enable Angular animations for UI components
    provideAnimations(),

    // Set the default locale for Angular Material date components to 'en-GB'
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },

    // Configure Toastr notifications with custom settings
    provideToastr({
      timeOut: 3000, // Duration for which the notification will be displayed (in milliseconds)
      positionClass: 'toast-top-right', // Position of the notification on the screen
      preventDuplicates: true // Prevent duplicate notifications from being displayed
    })
  ]
};