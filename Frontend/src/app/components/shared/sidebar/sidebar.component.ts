// Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleType } from '../../../classes/enums/role-type';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

// Types for menu items
interface SubMenuItem {
  label: string;
  filter: string;
  route?: string;
}

interface MenuItem {
  label: string;
  filter: string;
  role: RoleType;
  route?: string;
  children?: SubMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  // Main properties for the sidebar
  menuItems: MenuItem[] = [];
  userRole?: RoleType;
  userName?: string;
  userLastName?: string;
  currentExpandedMenu?: string;

  constructor(private authService: AuthService, private router: Router) {}

  // Initialize component and check user auth
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser?.type;
    this.userName = currentUser?.nom;
    this.userLastName = currentUser?.prenom;
    this.initializeMenuItems();

    if (this.userRole) {
      this.redirectToDashboard();
    } else {
      this.router.navigate(['/']);
    }
  }

  // Redirect user to their role-specific dashboard
  private redirectToDashboard(): void {
    const roleDashboardMap: Record<RoleType, string> = {
      [RoleType.ENCADRANT]: '/encadrant-dashboard',
      [RoleType.SERVICE_ADMINISTRATIVE]: '/service-administrative-dashboard',
      [RoleType.DCRH]: '/dcrh-dashboard',
      [RoleType.CENTRE_DE_FORMATION]: '/centre-formation-dashboard',
      [RoleType.STAGIAIRE]: '/intern-list'
    };

    const dashboardRoute = this.userRole ? roleDashboardMap[this.userRole] : undefined;
    if (dashboardRoute) {
      this.router.navigate([dashboardRoute]);
    }
  }

  // Set up menu items based on user role
  private initializeMenuItems(): void {
    // Define menu structure for each role
    const menuMap: Record<RoleType, MenuItem[]> = {
      [RoleType.ENCADRANT]: [
        { label: 'Tableau de bord', filter: 'dashboard', role: RoleType.ENCADRANT, route: '/encadrant-dashboard' },
        {
          label: 'Demandes',
          filter: 'demande',
          role: RoleType.ENCADRANT,
          children: [
            { label: 'En attente', filter: 'demande_en_attente' },
            { label: 'Validées', filter: 'demande_valide' }
          ]
        },
        {
          label: 'Rapports',
          filter: 'rapport',
          role: RoleType.ENCADRANT,
          children: [
            { label: 'En attente', filter: 'rapport_en_attente' },
            { label: 'Validés', filter: 'rapport_valide' }
          ]
        }
      ],
      [RoleType.SERVICE_ADMINISTRATIVE]: [
        { label: 'Tableau de bord', filter: 'dashboard', role: RoleType.SERVICE_ADMINISTRATIVE, route: '/service-administrative-dashboard' },
        {
          label: 'Classements',
          filter: 'classement',
          role: RoleType.SERVICE_ADMINISTRATIVE,
          children: [
            { label: 'En attente', filter: 'classement_en_attente' },
            { label: 'Validés', filter: 'classement_valide' }
          ]
        },
        {
          label: 'Prises de service',
          filter: 'prise_service',
          role: RoleType.SERVICE_ADMINISTRATIVE,
          children: [
            { label: 'En attente', filter: 'prise_service_en_attente' },
            { label: 'Validées', filter: 'prise_service_valide' }
          ]
        },
        {
          label: 'Bulletins',
          filter: 'bulletin',
          role: RoleType.SERVICE_ADMINISTRATIVE,
          children: [
            { label: 'En attente', filter: 'bulletin_en_attente' },
            { label: 'Validés', filter: 'bulletin_valide' }
          ]
        },
        {
          label: 'Attestations',
          filter: 'attestation',
          role: RoleType.SERVICE_ADMINISTRATIVE,
          children: [
            { label: 'En attente', filter: 'attestation_en_attente' },
            { label: 'Soumises', filter: 'attestation_valide' }
          ]
        },
        {
          label: 'Gestion des utilisateurs',
          filter: 'users',
          role: RoleType.SERVICE_ADMINISTRATIVE,
          children: [
            { label: 'Administrateurs', filter: 'users_admin', route: '/users-admin' },
            { label: 'Encadrants', filter: 'users_encadrant', route: '/users-encadrant' },
            { label: 'DCRH', filter: 'users_dcrh', route: '/users-dcrh' },
            { label: 'Centre de Formation', filter: 'users_centre_formation', route: '/users-centre-formation' }
          ]
        }
      ],
      [RoleType.DCRH]: [
        { label: 'Tableau de bord', filter: 'dashboard', role: RoleType.DCRH, route: '/dcrh-dashboard' },
        {
          label: 'Stagiaires',
          filter: 'stagiaire',
          role: RoleType.DCRH,
          children: [
            { label: 'En attente', filter: 'stagiaire_en_attente' },
            { label: 'Validés', filter: 'stagiaire_valide' }
          ]
        }
      ],
      [RoleType.CENTRE_DE_FORMATION]: [
        { label: 'Tableau de bord', filter: 'dashboard', role: RoleType.CENTRE_DE_FORMATION, route: '/centre-formation-dashboard' },
        {
          label: 'Convocations',
          filter: 'convocation',
          role: RoleType.CENTRE_DE_FORMATION,
          children: [
            { label: 'En attente', filter: 'convocation_en_attente' },
            { label: 'Envoyées', filter: 'convocation_envoyer' },
            { label: 'Reçues', filter: 'convocation_recus' },
            { label: 'Validées', filter: 'convocation_valide' }
          ]
        },
        {
          label: 'Documents',
          filter: 'document',
          role: RoleType.CENTRE_DE_FORMATION,
          children: [
            { label: 'En attente', filter: 'document_en_attente' },
            { label: 'Validés', filter: 'document_valide' }
          ]
        }
      ],
      [RoleType.STAGIAIRE]: [
        { label: 'Tableau de bord', filter: 'dashboard', role: RoleType.STAGIAIRE, route: '/stagiaire-dashboard' },
        { label: 'Demande', filter: 'demande', role: RoleType.STAGIAIRE, route: '/demande' },
        { label: 'Convocation', filter: 'convocation', role: RoleType.STAGIAIRE, route: '/convocation'},
        { label: 'Document', filter: 'document', role: RoleType.STAGIAIRE, route: '/document' },
        { label: 'Fin du stage', filter: 'fin_stage', role: RoleType.STAGIAIRE, route: '/fin-du-stage' }
      ]
    };

    // Set menu items based on user role
    this.menuItems = this.userRole ? menuMap[this.userRole] || [] : [];
  }

  // Get the appropriate icon for each menu item
  getIconForMenuItem(item: MenuItem | SubMenuItem): string {
    // Icon mapping for different menu items
    const iconMap: { [key: string]: string } = {
      dashboard: 'fas fa-tachometer-alt',
      demande: 'fas fa-file-alt',
      demande_en_attente: 'fas fa-clock',
      convocation: 'fas fa-envelope',
      demande_valide: 'fas fa-check-circle',
      convocation_en_attente: 'fas fa-clock',
      convocation_envoyer: 'fas fa-paper-plane',
      convocation_recus: 'fas fa-inbox',
      convocation_valide: 'fas fa-check-square',
      document: 'fas fa-folder',
      document_en_attente: 'fas fa-clock',
      document_valide: 'fas fa-check-circle',
      fin_stage: 'fas fa-flag-checkered',
      stagiaire: 'fas fa-user-graduate',
      stagiaire_en_attente: 'fas fa-user-clock',
      stagiaire_valide: 'fas fa-user-check',
      classement: 'fas fa-sort-amount-down',
      classement_en_attente: 'far fa-clock',
      classement_valide: 'fas fa-check-circle',
      prise_service: 'fas fa-briefcase',
      prise_service_en_attente: 'fas fa-hourglass-half',
      prise_service_valide: 'fas fa-check-double',
      bulletin: 'fas fa-file-invoice',
      bulletin_en_attente: 'fas fa-pause-circle',
      bulletin_valide: 'fas fa-check-square',
      attestation: 'fas fa-file-signature',
      attestation_en_attente: 'fas fa-file-upload',
      attestation_valide: 'fas fa-check-square',
      rapport: 'fas fa-file-contract',
      rapport_en_attente: 'fas fa-file-upload',
      rapport_valide: 'fas fa-check-square',
      users: 'fas fa-users',
      users_admin: 'fas fa-users-cog',
      users_encadrant: 'fas fa-chalkboard-teacher',
      users_dcrh: 'fas fa-building',
      users_centre_formation: 'fas fa-graduation-cap'
    };

    const filter = item.filter.toLowerCase();
    return iconMap[filter] || 'fas fa-circle';
  }

  // Handle submenu expand/collapse
  toggleSubmenu(label: string) {
    if (this.currentExpandedMenu === label) {
      this.currentExpandedMenu = undefined;
    } else {
      this.currentExpandedMenu = label;
    }
  }
}
