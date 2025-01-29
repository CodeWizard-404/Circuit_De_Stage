// centre-formation-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { Demande } from '../../../../classes/demande';
import { User } from '../../../../classes/user';
import { DocumentStatus } from '../../../../classes/enums/document-status';
import { StageType } from '../../../../classes/enums/stage-type';

@Component({
  selector: 'app-centre-formation-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './centre-formation-dashboard.component.html',
  styleUrls: ['./centre-formation-dashboard.component.css']
})
export class CentreFormationDashboardComponent implements OnInit {
  admin: User | null = null;
  demandes: Demande[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private demandeService: DemandeService
  ) {}

  ngOnInit(): void {
    this.admin = this.authService.getCurrentUser() as User;
    this.loadDemandes();
  }

  private loadDemandes(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Error loading training data";
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  // Document statistics calculations
  get documentStats() {
    const allDocs = this.demandes.flatMap(d => d.documents);
    return {
      pending: allDocs.filter(d => d.status === DocumentStatus.SOUMIS).length,
      validated: allDocs.filter(d => d.status === DocumentStatus.VALIDE).length,
      rejected: allDocs.filter(d => d.status === DocumentStatus.REJETE).length,
      total: allDocs.length
    };
  }

  // Recent document submissions
  get recentDocuments() {
    return this.demandes
      .flatMap(d => d.documents)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  // Training program statistics
  get trainingStats() {
    const programs = new Map<StageType, number>();
    this.demandes.forEach(d => {
      programs.set(d.stage, (programs.get(d.stage) || 0) + 1);
    });
    return Array.from(programs.entries());
  }
}