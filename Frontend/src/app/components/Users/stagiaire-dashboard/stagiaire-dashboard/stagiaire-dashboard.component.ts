import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { Stagiaire } from '../../../../classes/stagiaire';
import { Demande } from '../../../../classes/demande';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-stagiaire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stagiaire-dashboard.component.html',
  styleUrls: ['./stagiaire-dashboard.component.css']
})
export class StagiaireDashboardComponent implements OnInit {
  stagiaire: Stagiaire | null = null;
  demande: Demande | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private demandeService: DemandeService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.stagiaire = this.authService.getCurrentUser() as Stagiaire;
    if (this.stagiaire) {
      this.loadDemandeInfo();
    } else {
      this.error = "Erreur d'authentification";
      this.isLoading = false;
    }
  }

  private loadDemandeInfo(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: async (demandes: Demande[]) => {
        this.demande = demandes.find(d => d.stagiaire.id === this.stagiaire?.id) || null;
        
        // Load encadrant details if demande exists
        if (this.demande?.encadrant?.id) {  // Add optional chaining
          try {
            const encadrant = await this.userService.getUserById(this.demande.encadrant.id).toPromise();
            if (encadrant) {
              this.demande.encadrant = { ...this.demande.encadrant, ...encadrant };
            }
          } catch (err) {
            console.error('Error loading encadrant details:', err);
          }
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des données";
        this.isLoading = false;
        console.error('Error loading demande:', err);
      }
    });
  }
  getDaysRemaining(): number {
    if (!this.demande?.finStage) return 0;
    const end = new Date(this.demande.finStage);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getStageProgress(): number {
    if (!this.demande?.debutStage || !this.demande?.finStage) return 0;
    const start = new Date(this.demande.debutStage);
    const end = new Date(this.demande.finStage);
    const today = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  getFullName(): string {
    if (this.stagiaire?.nom2) {
      return `${this.stagiaire.nom} et ${this.stagiaire.nom2}`;
    }
    return this.stagiaire?.nom + ' ' + this.stagiaire?.prenom || '';
  }

  getSecondaryFullName(): string {
    if (this.stagiaire?.nom2 && this.stagiaire?.prenom2) {
      return `${this.stagiaire.prenom2} ${this.stagiaire.nom2}`;
    }
    return '';
  }
}
