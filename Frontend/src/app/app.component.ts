import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Circuit De Stage';

  constructor(private router: Router) {}

  shouldShowSidebar(): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Ignore query parameters
    const hideSidebarRoutes = [
      '/login', 
      '/intern-form', 
      '/forgot-password', 
      '/confirmation', 
      '/'
    ];
    if (!this.isKnownRoute(currentUrl)) {
      return false;
    }
    
    return !hideSidebarRoutes.includes(currentUrl);
  }

  private isKnownRoute(url: string): boolean {
    const definedRoutes = routes
      .filter(route => route.path !== '**')
      .map(route => '/' + route.path);
    
    // Check exact matches first
    if (definedRoutes.includes(url)) {
      return true;
    }

    // Check parameterized routes
    const urlSegments = url.split('/');
    return definedRoutes.some(route => {
      const routeSegments = route.split('/');
      if (routeSegments.length !== urlSegments.length) {
        return false;
      }
      return routeSegments.every((segment, index) => {
        // If segment starts with ':', it's a parameter
        return segment.startsWith(':') || segment === urlSegments[index];
      });
    });
  }
}
