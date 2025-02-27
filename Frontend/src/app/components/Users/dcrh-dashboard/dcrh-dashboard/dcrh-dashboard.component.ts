import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Demande } from '../../../../classes/demande';
import { RoleType } from '../../../../classes/enums/role-type';
import { User } from '../../../../classes/user';
import { AuthService } from '../../../../services/auth.service';
import { DemandeService } from '../../../../services/demande.service';
import { UserService } from '../../../../services/user.service';


@Component({
  selector: 'app-dcrh-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dcrh-dashboard.component.html',
  styleUrls: ['./dcrh-dashboard.component.css']
})
export class DcrhDashboardComponent implements OnInit {
  currentUser: User | null = null; 
  demandes: Demande[] = [];
  encadrants: User[] = []; 
  isLoading = true; 
  error: string | null = null; 

  constructor(
    private authService: AuthService, 
    private demandeService: DemandeService, 
    private userService: UserService 
  ) {}

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser(); // Get the current user
    this.loadData(); // Load all demands and encadrants
  }

  // Load all demands from the server
  private loadData(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes; // Store the fetched demands
        this.loadEncadrants(); // Load encadrants after demands are fetched
      },
      error: (err) => this.handleError(err) // Handle errors during demand loading
    });
  }

  // Load all encadrants (supervisors) from the server
  private loadEncadrants(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.encadrants = users.filter(u => u.type === RoleType.ENCADRANT); // Filter users by role type "Encadrant"
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => this.handleError(err) // Handle errors during user loading
    });
  }

  // Handle errors during data loading
  private handleError(err: any): void {
    this.error = "Erreur lors du chargement des données"; // Show an error message
    this.isLoading = false; // Stop the loading indicator
  }

  // Get the total number of interns (stagiaires)
  getTotalInterns(): number {
    return this.demandes.length; // Count all demands
  }

  // Get the number of active interns (stagiaires)
  getActiveInterns(): number {
    const today = new Date(); // Get the current date
    return this.demandes.filter(d => 
      new Date(d.debutStage) <= today && today <= new Date(d.finStage) // Only include demands with start and end dates encompassing today
    ).length;
  }

  // Get the workload (number of assigned stagiaires) for a specific encadrant
  getEncadrantWorkload(encadrantId: number): number {
    return this.demandes.filter(d => d.encadrant?.id === encadrantId).length; // Count demands assigned to the given encadrant
  }

  // Get the distribution of demands by status
  getStatusDistribution(): { [key: string]: number } {
    return this.demandes.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1; // Increment the count for each status
      return acc;
    }, {} as { [key: string]: number }); // Return an object with status counts
  }

  // Get the most recent validated demands (up to 5)
  getRecentValidations(): Demande[] {
    return this.demandes
      .filter(d => d.status === 'VALIDE') // Only include validated demands
      .sort((a, b) => new Date(b.debutStage).getTime() - new Date(a.debutStage).getTime()) // Sort by start date (newest first)
      .slice(0, 5); // Take the top 5
  }
}