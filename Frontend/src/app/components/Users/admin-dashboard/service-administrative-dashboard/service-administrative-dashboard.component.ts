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
    this.today = new Date(); 
  }

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.admin = this.authService.getCurrentUser() as User; // Get the current user
    if (this.admin) {
      this.loadDemandes(); // Load all demands if the user is authenticated
    } else {
      this.error = "Erreur d'authentification"; // Show an error message if authentication fails
      this.isLoading = false; // Stop the loading indicator
    }
  }

  // Load all demands from the server
  private loadDemandes(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes; // Store the fetched demands
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des données"; // Show an error message
        this.isLoading = false; // Stop the loading indicator
      }
    });
  }

  // Get the number of pending demands
  getPendingDemandesCount(): number {
    return this.demandes.filter(d => d.status === 'SOUMISE').length; // Count demands with status "SOUMISE"
  }

  // Get the number of accepted demands
  getAcceptedDemandesCount(): number {
    return this.demandes.filter(d => d.status === 'VALIDE').length; // Count demands with status "VALIDE"
  }

  // Get the number of rejected demands
  getRejectedDemandesCount(): number {
    return this.demandes.filter(d => d.status === 'REJETEE').length; // Count demands with status "REJETEE"
  }

  // Get the number of current stagiaires (interns)
  getCurrentStagiairesCount(): number {
    const today = new Date(); // Get the current date
    return this.demandes.filter(d => {
      const startDate = new Date(d.debutStage); // Start date of the internship
      const endDate = new Date(d.finStage); // End date of the internship
      return startDate <= today && today <= endDate; // Only include demands where today is within the internship period
    }).length;
  }

  // Get the number of demands created this month
  getDemandesThisMonth(): number {
    const now = new Date(); // Get the current date
    return this.demandes.filter(d => {
      const demandeDate = new Date(d.debutStage); // Start date of the demand
      return demandeDate.getMonth() === now.getMonth() && // Check if the month matches
             demandeDate.getFullYear() === now.getFullYear(); // Check if the year matches
    }).length;
  }

  // Get the most recent demands (up to 5)
  getRecentDemandes(): Demande[] {
    return this.demandes
      .sort((a, b) => new Date(b.debutStage).getTime() - new Date(a.debutStage).getTime()) // Sort by start date (newest first)
      .slice(0, 5); // Take the top 5
  }

  // Get the distribution of demands by stage type
  getStageTypeDistribution(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {}; // Initialize an empty object
    this.demandes.forEach(d => {
      distribution[d.stage] = (distribution[d.stage] || 0) + 1; // Increment the count for each stage type
    });
    return distribution; // Return the distribution object
  }

  // Get the completion rate of demands
  getCompletionRate(): number {
    const completed = this.demandes.filter(d => d.status !== 'SOUMISE').length; // Count demands that are not "SOUMISE"
    return this.demandes.length ? (completed / this.demandes.length) * 100 : 0; // Calculate the percentage of completed demands
  }
}