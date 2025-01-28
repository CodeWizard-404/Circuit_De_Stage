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
  title = 'Frontend';

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
    
    return definedRoutes.includes(url);
  }
}
