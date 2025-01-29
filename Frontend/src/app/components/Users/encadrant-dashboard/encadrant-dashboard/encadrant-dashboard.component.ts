import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Demande } from '../../../../classes/demande';
import { User } from '../../../../classes/user';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { DocumentService } from '../../../../services/document.service';
import { DemandeStatus } from '../../../../classes/enums/demande-status';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './encadrant-dashboard.component.html',
  styleUrls: ['./encadrant-dashboard.component.css']
})
export class EncadrantDashboardComponent implements OnInit {
  encadrant: User | null = null;
  demandes: Demande[] = [];
  pendingDocuments: Document[] = [];
  isLoading = true;
  error: string | null = null;
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private demandeService: DemandeService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.encadrant = this.authService.getCurrentUser() as User;
    if (this.encadrant) {
      this.loadDashboardData();
    } else {
      this.error = "Erreur d'authentification";
      this.isLoading = false;
    }
  }

  private loadDashboardData(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes.filter(d => d.encadrant?.id === this.encadrant?.id);
      },
      error: (err) => this.handleError(err)
    });
  }



  private handleError(err: any): void {
    this.error = "Erreur lors du chargement des données";
    this.isLoading = false;
    console.error('Dashboard error:', err);
  }

  getActiveInternsCount(): number {
    return this.demandes.filter(d => 
      new Date(d.debutStage) <= this.today && 
      new Date(d.finStage) >= this.today
    ).length;
  }

  getPendingValidationsCount(): number {
    return this.demandes.filter(d => d.status === 'SOUMISE').length;
  }

  getCompletedValidationsCount(): number {
    return this.demandes.filter(d => d.status === 'VALIDE').length;
  }

  getRecentPendingDemandes(): Demande[] {
    return this.demandes
      .filter(d => d.status === DemandeStatus.SOUMISE)
      .slice(0, 5);
  }
}