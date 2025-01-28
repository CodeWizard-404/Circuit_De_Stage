import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleType } from '../../../classes/enums/role-type';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  filter: string;
  role: RoleType;
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  userRole?: RoleType;
  userName?: string;
  userLastName?: string;

  constructor(private authService: AuthService, private router: Router) {}

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

  private initializeMenuItems(): void {
    const menuMap: Record<RoleType, MenuItem[]> = {
      [RoleType.ENCADRANT]: [
        { label: 'Dashboard', filter: 'dashboard',role: RoleType.ENCADRANT, route: '/encadrant-dashboard' },
        { label: 'Demandes en attente', filter: 'demande_en_attente', role: RoleType.ENCADRANT },
        { label: 'Demandes validées', filter: 'demande_valide', role: RoleType.ENCADRANT },
        { label: 'Rapports en attente', filter: 'rapport_en_attente', role: RoleType.ENCADRANT },
        { label: 'Rapports validés', filter: 'rapport_valide', role: RoleType.ENCADRANT }
      ],
      [RoleType.SERVICE_ADMINISTRATIVE]: [
        { label: 'Dashboard', filter: 'dashboard',role: RoleType.SERVICE_ADMINISTRATIVE, route: '/service-administrative-dashboard' },
        { label: 'Classements en attente', filter: 'classement_en_attente', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Classements validés', filter: 'classement_valide', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Prise de service en attente', filter: 'prise_service_en_attente', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Prise de service validée', filter: 'prise_service_valide', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins en attente', filter: 'bulletin_en_attente', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins envoyés', filter: 'bulletin_envoyer', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins reçus', filter: 'bulletin_recus', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins validés', filter: 'bulletin_valide', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Users Admin', filter: 'users_admin', role: RoleType.SERVICE_ADMINISTRATIVE, route: '/users-admin' },
        { label: 'Users Encadrant', filter: 'users_encadrant', role: RoleType.SERVICE_ADMINISTRATIVE, route: '/users-encadrant' },
        { label: 'Users DCRH', filter: 'users_dcrh', role: RoleType.SERVICE_ADMINISTRATIVE, route: '/users-dcrh' },
        { label: 'Users Centre de Formation', filter: 'users_centre_formation', role: RoleType.SERVICE_ADMINISTRATIVE, route: '/users-centre-formation' }
      ],
      [RoleType.DCRH]: [
        { label: 'Dashboard', filter: 'dashboard',role: RoleType.DCRH, route: '/dcrh-dashboard' },
        { label: 'Stagiaires en attente', filter: 'stagiaire_en_attente', role: RoleType.DCRH },
        { label: 'Stagiaires validés', filter: 'stagiaire_valide', role: RoleType.DCRH }
      ],
      [RoleType.CENTRE_DE_FORMATION]: [
        { label: 'Dashboard', filter: 'dashboard',role: RoleType.CENTRE_DE_FORMATION, route: '/users-admin' },
        { label: 'Convocations en attente', filter: 'convocation_en_attente', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Convocations envoyées', filter: 'convocation_envoyer', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Convocations reçues', filter: 'convocation_recus', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Convocations validées', filter: 'convocation_valide', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Documents en attente', filter: 'document_en_attente', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Documents validés', filter: 'document_valide', role: RoleType.CENTRE_DE_FORMATION }
      ],
      [RoleType.STAGIAIRE]: [
        { label: 'Dashboard', filter: 'dashboard',role: RoleType.STAGIAIRE, route: '/stagiaire-dashboard' },


      ]
    };

    this.menuItems = this.userRole ? menuMap[this.userRole] || [] : [];
  }
}
