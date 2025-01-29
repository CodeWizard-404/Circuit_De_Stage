import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DemandeService } from '../../../../services/demande.service';
import { AuthService } from '../../../../services/auth.service';
import { Demande } from '../../../../classes/demande';
import { Stagiaire } from '../../../../classes/stagiaire';
import { DocumentType } from '../../../../classes/enums/document-type';

@Component({
  selector: 'app-demande',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './demande.component.html',
  styleUrls: ['./demande.component.css']
})
export class DemandeComponent implements OnInit {
  demande: Demande | null = null;
  stagiaire: Stagiaire | null = null;
  isLoading = true;
  error: string | null = null;
  documentTypes: DocumentType[] = [];
  protected DocumentType = DocumentType;

  constructor(private demandeService: DemandeService, private authService: AuthService) {}

  ngOnInit(): void {
    try {
      this.stagiaire = this.authService.getCurrentUser() as Stagiaire;
      console.log('Current stagiaire:', this.stagiaire);
      
      if (this.stagiaire) {
        // Get all demandes and filter for this stagiaire
        this.demandeService.getAllDemandes().subscribe({
          next: (demandes: Demande[]) => {
            const stagiaireDemande = demandes.find(d => d.stagiaire.id === this.stagiaire?.id);
            if (stagiaireDemande) {
              console.log('Found demande:', stagiaireDemande);
              this.loadDemande(stagiaireDemande.id);
              this.loadDocumentTypes(stagiaireDemande.id);
            } else {
              this.isLoading = false;
              this.error = "Aucune demande trouvée pour ce stagiaire";
              console.warn('No demandes found for stagiaire');
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.error = "Erreur lors du chargement des demandes";
            console.error('Error loading demandes:', err);
          }
        });
      } else {
        this.isLoading = false;
        this.error = "Aucun stagiaire trouvé";
        console.warn('No stagiaire found');
      }
    } catch (err) {
      this.isLoading = false;
      this.error = "Erreur lors du chargement des données";
      console.error('Error:', err);
    }
  }

  loadDemande(demandeId: number): void {
    this.isLoading = true;
    this.demandeService.getDemandeDetails(demandeId).subscribe({
      next: (data: Demande) => {
        this.demande = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement de la demande";
        this.isLoading = false;
        console.error('Error loading demande:', err);
      }
    });
  }

  loadDocumentTypes(demandeId: number): void {
    this.demandeService.getDocumentTypes(demandeId).subscribe({
      next: (types: DocumentType[]) => {
        this.documentTypes = types;
      },
      error: (err) => {
        console.error('Error loading document types:', err);
        this.error = "Erreur lors du chargement des types de documents";
      }
    });
  }

  hasDocument(documentType: string): boolean {
    return this.documentTypes.includes(documentType as DocumentType);
  }

  isDocumentValidated(documentType: string): boolean {
    return this.demande?.documents.some(doc => 
      doc.type === documentType && doc.status === 'VALIDE'
    ) ?? false;
  }
}
