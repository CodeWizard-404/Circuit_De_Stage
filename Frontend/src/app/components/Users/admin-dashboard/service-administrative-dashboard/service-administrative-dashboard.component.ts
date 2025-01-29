import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { Demande } from '../../../../classes/demande';
import { User } from '../../../../classes/user';

@Component({
  selector: 'app-service-administrative-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-administrative-dashboard.component.html',
  styleUrls: ['./service-administrative-dashboard.component.css']
})
export class ServiceAdministrativeDashboardComponent implements OnInit {
  admin: User | null = null;
  demandes: Demande[] = [];
  isLoading = true;
  error: string | null = null;
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private demandeService: DemandeService
  ) {
    this.today = new Date(); // Initialize today's date
  }

  ngOnInit(): void {
    this.admin = this.authService.getCurrentUser() as User;
    if (this.admin) {
      this.loadDemandes();
    } else {
      this.error = "Erreur d'authentification";
      this.isLoading = false;
    }
  }

  private loadDemandes(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des données";
        this.isLoading = false;
        console.error('Error loading demandes:', err);
      }
    });
  }

  getPendingDemandesCount(): number {
    return this.demandes.filter(d => d.status === 'SOUMISE').length;
  }

  getAcceptedDemandesCount(): number {
    return this.demandes.filter(d => d.status === 'VALIDE').length;
  }

  getRejectedDemandesCount(): number {
    return this.demandes.filter(d => d.status === 'REJETEE').length;
  }

  getCurrentStagiairesCount(): number {
    const today = new Date();
    return this.demandes.filter(d => {
      const startDate = new Date(d.debutStage);
      const endDate = new Date(d.finStage);
      return startDate <= today && today <= endDate;
    }).length;
  }

  getDemandesThisMonth(): number {
    const now = new Date();
    return this.demandes.filter(d => {
      const demandeDate = new Date(d.debutStage);
      return demandeDate.getMonth() === now.getMonth() && 
             demandeDate.getFullYear() === now.getFullYear();
    }).length;
  }

  getRecentDemandes(): Demande[] {
    return this.demandes
      .sort((a, b) => new Date(b.debutStage).getTime() - new Date(a.debutStage).getTime())
      .slice(0, 5);
  }

  getStageTypeDistribution(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    this.demandes.forEach(d => {
      distribution[d.stage] = (distribution[d.stage] || 0) + 1;
    });
    return distribution;
  }

  getCompletionRate(): number {
    const completed = this.demandes.filter(d => d.status !== 'SOUMISE').length;
    return this.demandes.length ? (completed / this.demandes.length) * 100 : 0;
  }
}
