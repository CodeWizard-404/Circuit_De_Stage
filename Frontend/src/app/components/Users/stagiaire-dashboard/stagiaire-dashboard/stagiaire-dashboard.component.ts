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

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.stagiaire = this.authService.getCurrentUser() as Stagiaire; // Get the current user
    if (this.stagiaire) {
      this.loadDemandeInfo(); // Load demande information if the user is authenticated
    } else {
      this.error = "Erreur d'authentification"; // Show an error message if authentication fails
      this.isLoading = false; // Stop the loading indicator
    }
  }

  // Load demande information for the current stagiaire
  private loadDemandeInfo(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: async (demandes: Demande[]) => {
        // Find the demande associated with the current stagiaire
        this.demande = demandes.find(d => d.stagiaire.id === this.stagiaire?.id) || null;

        // If the demande has an encadrant (supervisor), load their details
        if (this.demande?.encadrant?.id) { // Use optional chaining to safely access properties
          try {
            const encadrant = await this.userService.getUserById(this.demande.encadrant.id).toPromise();
            if (encadrant) {
              this.demande.encadrant = { ...this.demande.encadrant, ...encadrant }; // Merge encadrant details
            }
          } catch (err) {
            console.error('Error loading encadrant details:', err); // Log the error for debugging
          }
        }

        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des données"; // Show an error message
        this.isLoading = false; // Stop the loading indicator
      }
    });
  }

  // Calculate the number of days remaining until the internship ends
  getDaysRemaining(): number {
    if (!this.demande?.finStage) return 0; // Return 0 if no end date is available
    const end = new Date(this.demande.finStage); // End date of the internship
    const today = new Date(); // Current date
    const diff = end.getTime() - today.getTime(); // Difference in milliseconds
    return Math.ceil(diff / (1000 * 3600 * 24)); // Convert milliseconds to days
  }

  // Calculate the progress of the internship as a percentage
  getStageProgress(): number {
    if (!this.demande?.debutStage || !this.demande?.finStage) return 0; // Return 0 if start or end dates are missing
    const start = new Date(this.demande.debutStage); // Start date of the internship
    const end = new Date(this.demande.finStage); // End date of the internship
    const today = new Date(); // Current date
    const total = end.getTime() - start.getTime(); // Total duration in milliseconds
    const elapsed = today.getTime() - start.getTime(); // Elapsed time in milliseconds
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))); // Calculate percentage and clamp between 0 and 100
  }

  // Get the full name of the stagiaire
  getFullName(): string {
    if (this.stagiaire?.nom2) {
      return `${this.stagiaire.nom} et ${this.stagiaire.nom2}`; // Include secondary name if available
    }
    return this.stagiaire?.nom + ' ' + this.stagiaire?.prenom || ''; // Combine first and last names
  }

  // Get the secondary full name of the stagiaire
  getSecondaryFullName(): string {
    if (this.stagiaire?.nom2 && this.stagiaire?.prenom2) {
      return `${this.stagiaire.prenom2} ${this.stagiaire.nom2}`; // Combine secondary first and last names
    }
    return ''; // Return empty string if secondary names are not available
  }
}