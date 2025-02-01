// centre-formation-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { Demande } from '../../../../classes/demande';
import { User } from '../../../../classes/user';
import { DemandeStatus } from '../../../../classes/enums/demande-status';
import { StageType } from '../../../../classes/enums/stage-type';

@Component({
  selector: 'app-centre-formation-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './centre-formation-dashboard.component.html',
  styleUrls: ['./centre-formation-dashboard.component.css']
})
export class CentreFormationDashboardComponent implements OnInit {
  currentUser: User | null = null;
  demandes: Demande[] = [];
  isLoading = true;
  error: string | null = null;
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private demandeService: DemandeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() as User;
    this.loadDemandes();
  }

  private loadDemandes(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur de chargement des données";
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  get activeStagiaires(): number {
    return this.demandes.filter(d => 
      d.status === DemandeStatus.VALIDE && 
      new Date(d.finStage) > new Date()
    ).length;
  }

  get completedStagiaires(): number {
    return this.demandes.filter(d => 
      d.status === DemandeStatus.TERMINEE
    ).length;
  }

  getDemandesThisMonth(): number {
    const now = new Date();
    return this.demandes.filter(d => {
      const demandeDate = new Date(d.debutStage);
      return demandeDate.getMonth() === now.getMonth() && 
             demandeDate.getFullYear() === now.getFullYear();
    }).length;
  }

  getValidatedDemandesCount(): number {
    return this.demandes.filter(d => d.status === DemandeStatus.VALIDE).length;
  }


  get recentDemandes(): Demande[] {
    return this.demandes
      .sort((a, b) => new Date(b.debutStage).getTime() - new Date(a.debutStage).getTime())
      .slice(0, 5);
  }

  get trainingStats() {
    const programs = new Map<StageType, number>();
    this.demandes.forEach(d => {
      programs.set(d.stage, (programs.get(d.stage) || 0) + 1);
    });
    return Array.from(programs.entries());
  }
}