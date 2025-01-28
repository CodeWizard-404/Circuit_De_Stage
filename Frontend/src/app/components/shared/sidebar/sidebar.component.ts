import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleType } from '../../../classes/enums/role-type';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  filter: string;
  role: RoleType;
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUser()?.type;
    this.initializeMenuItems();
  }

  private initializeMenuItems(): void {
    const menuMap: Record<RoleType, MenuItem[]> = {
      [RoleType.ENCADRANT]: [
        { label: 'Demandes en attente', filter: 'demande_en_attente', role: RoleType.ENCADRANT },
        { label: 'Demandes validées', filter: 'demande_valide', role: RoleType.ENCADRANT },
        { label: 'Rapports en attente', filter: 'rapport_en_attente', role: RoleType.ENCADRANT },
        { label: 'Rapports validés', filter: 'rapport_valide', role: RoleType.ENCADRANT }
      ],
      [RoleType.SERVICE_ADMINISTRATIVE]: [
        { label: 'Classements en attente', filter: 'classement_en_attente', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Classements validés', filter: 'classement_valide', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Prise de service en attente', filter: 'prise_service_en_attente', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Prise de service validée', filter: 'prise_service_valide', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins en attente', filter: 'bulletin_en_attente', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins envoyés', filter: 'bulletin_envoyer', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins reçus', filter: 'bulletin_recus', role: RoleType.SERVICE_ADMINISTRATIVE },
        { label: 'Bulletins validés', filter: 'bulletin_valide', role: RoleType.SERVICE_ADMINISTRATIVE }
      ],
      [RoleType.DCRH]: [
        { label: 'Stagiaires en attente', filter: 'stagiaire_en_attente', role: RoleType.DCRH },
        { label: 'Stagiaires validés', filter: 'stagiaire_valide', role: RoleType.DCRH }
      ],
      [RoleType.CENTRE_DE_FORMATION]: [
        { label: 'Convocations en attente', filter: 'convocation_en_attente', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Convocations envoyées', filter: 'convocation_envoyer', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Convocations reçues', filter: 'convocation_recus', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Convocations validées', filter: 'convocation_valide', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Documents en attente', filter: 'document_en_attente', role: RoleType.CENTRE_DE_FORMATION },
        { label: 'Documents validés', filter: 'document_valide', role: RoleType.CENTRE_DE_FORMATION }
      ],
      [RoleType.STAGIAIRE]: []
    };

    this.menuItems = this.userRole ? menuMap[this.userRole] || [] : [];
  }
}
