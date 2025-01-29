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

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  private loadData(): void {
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.loadEncadrants();
      },
      error: (err) => this.handleError(err)
    });
  }

  private loadEncadrants(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.encadrants = users.filter(u => u.type === RoleType.ENCADRANT);
        this.isLoading = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: any): void {
    this.error = "Erreur lors du chargement des données";
    this.isLoading = false;
    console.error(err);
  }

  getTotalInterns(): number {
    return this.demandes.length;
  }

  getActiveInterns(): number {
    const today = new Date();
    return this.demandes.filter(d => 
      new Date(d.debutStage) <= today && today <= new Date(d.finStage)
    ).length;
  }

  getEncadrantWorkload(encadrantId: number): number {
    return this.demandes.filter(d => d.encadrant?.id === encadrantId).length;
  }

  getStatusDistribution(): { [key: string]: number } {
    return this.demandes.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  getRecentValidations(): Demande[] {
    return this.demandes
      .filter(d => d.status === 'VALIDE')
      .sort((a, b) => new Date(b.debutStage).getTime() - new Date(a.debutStage).getTime())
      .slice(0, 5);
  }
}