import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Demande } from '../../../../classes/demande';
import { User } from '../../../../classes/user';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
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
  isLoading = true;
  error: string | null = null;
  today: Date = new Date();

  constructor(
    private authService: AuthService, 
    private demandeService: DemandeService 
  ) {}

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.encadrant = this.authService.getCurrentUser() as User; // Get the current user
    if (this.encadrant) {
      this.loadDashboardData(); // Load dashboard data if the user is authenticated
    } else {
      this.error = "Erreur d'authentification"; // Show an error message if authentication fails
      this.isLoading = false; // Stop the loading indicator
    }
  }

  // Load all demands from the server
  private loadDashboardData(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes; // Store the fetched demands
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => this.handleError(err) // Handle errors during data loading
    });
  }

  // Handle errors during data loading
  private handleError(err: any): void {
    this.error = "Erreur lors du chargement des données"; // Show an error message
    this.isLoading = false; // Stop the loading indicator
  }

  // Get the number of active interns (stagiaires)
  getActiveInternsCount(): number {
    return this.demandes.filter(d => 
      new Date(d.debutStage) <= this.today && // Only include demands with start dates before or on today
      new Date(d.finStage) >= this.today // Only include demands with end dates after or on today
    ).length;
  }

  // Get the number of pending validations
  getPendingValidationsCount(): number {
    return this.demandes.filter(d => d.status === 'SOUMISE').length; // Count demands with status "SOUMISE"
  }

  // Get the number of completed validations
  getCompletedValidationsCount(): number {
    return this.demandes.filter(d => d.status === 'VALIDE').length; // Count demands with status "VALIDE"
  }

  // Get the most recent pending demands (up to 5)
  getRecentPendingDemandes(): Demande[] {
    return this.demandes
      .filter(d => d.status === DemandeStatus.SOUMISE) // Only include demands with status "SOUMISE"
      .slice(0, 5); // Take the first 5
  }
}