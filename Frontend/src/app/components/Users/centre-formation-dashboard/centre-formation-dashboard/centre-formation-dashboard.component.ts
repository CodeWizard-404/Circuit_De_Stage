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

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() as User; // Get the current user
    this.loadDemandes(); // Load all demands from the server
  }

  // Fetch all demands from the server
  private loadDemandes(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes; // Store the fetched demands
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => {
        this.error = "Erreur de chargement des données"; // Show an error message
        this.isLoading = false; // Stop the loading indicator
      }
    });
  }

  // Get the number of active stagiaires (interns)
  get activeStagiaires(): number {
    return this.demandes.filter(d => 
      d.status === DemandeStatus.VALIDE && // Only include validated demands
      new Date(d.finStage) > new Date() // Only include demands with end dates in the future
    ).length;
  }

  // Get the number of completed stagiaires (interns)
  get completedStagiaires(): number {
    return this.demandes.filter(d => 
      d.status === DemandeStatus.TERMINEE // Only include completed demands
    ).length;
  }

  // Get the number of demands created this month
  getDemandesThisMonth(): number {
    const now = new Date(); // Get the current date
    return this.demandes.filter(d => {
      const demandeDate = new Date(d.debutStage); // Get the start date of the demand
      return demandeDate.getMonth() === now.getMonth() && // Check if the month matches
             demandeDate.getFullYear() === now.getFullYear(); // Check if the year matches
    }).length;
  }

  // Get the total number of validated demands
  getValidatedDemandesCount(): number {
    return this.demandes.filter(d => d.status === DemandeStatus.VALIDE).length; // Count only validated demands
  }

  // Get the most recent demands (up to 5)
  get recentDemandes(): Demande[] {
    return this.demandes
      .sort((a, b) => new Date(b.debutStage).getTime() - new Date(a.debutStage).getTime()) // Sort by start date (newest first)
      .slice(0, 5); // Take the top 5
  }

  // Get statistics about training programs
  get trainingStats() {
    const programs = new Map<StageType, number>(); // Create a map to store program counts
    this.demandes.forEach(d => {
      programs.set(d.stage, (programs.get(d.stage) || 0) + 1); // Increment the count for each stage type
    });
    return Array.from(programs.entries()); // Convert the map to an array of key-value pairs
  }
}