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

  constructor(
    private demandeService: DemandeService, 
    private authService: AuthService 
  ) {}

  // Initialize component data when the component loads
  ngOnInit(): void {
    try {
      this.stagiaire = this.authService.getCurrentUser() as Stagiaire; // Get the current stagiaire

      if (this.stagiaire) {
        // Fetch all demands and find the one associated with the current stagiaire
        this.demandeService.getAllDemandes().subscribe({
          next: (demandes: Demande[]) => {
            const stagiaireDemande = demandes.find(d => d.stagiaire.id === this.stagiaire?.id);
            if (stagiaireDemande) {
              this.loadDemande(stagiaireDemande.id); // Load detailed information for the demande
              this.loadDocumentTypes(stagiaireDemande.id); // Load available document types for the demande
            } else {
              this.isLoading = false;
              this.error = "Aucune demande trouvée pour ce stagiaire"; // Show an error message if no demande is found
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.error = "Erreur lors du chargement des demandes"; // Show an error message
          }
        });
      } else {
        this.isLoading = false;
        this.error = "Aucun stagiaire trouvé"; // Show an error message if no stagiaire is found
      }
    } catch (err) {
      this.isLoading = false;
      this.error = "Erreur lors du chargement des données"; // Show an error message for unexpected errors
    }
  }

  // Load detailed information for a specific demande
  loadDemande(demandeId: number): void {
    this.isLoading = true; // Start loading indicator
    this.demandeService.getDemandeDetails(demandeId).subscribe({
      next: (data: Demande) => {
        this.demande = data; // Store the fetched demande details
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => {
        this.error = "Erreur lors du chargement de la demande"; // Show an error message
        this.isLoading = false; // Stop the loading indicator
      }
    });
  }

  // Load available document types for a specific demande
  loadDocumentTypes(demandeId: number): void {
    this.demandeService.getDocumentTypes(demandeId).subscribe({
      next: (types: DocumentType[]) => {
        this.documentTypes = types; // Store the fetched document types
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des types de documents"; // Show an error message
      }
    });
  }

  // Check if a specific document type is available for the demande
  hasDocument(documentType: string): boolean {
    const hasDoc = this.documentTypes.includes(documentType as DocumentType); // Check if the document type exists
    return hasDoc;
  }

  // Check if a specific document type is validated
  isDocumentValidated(documentType: string): boolean {
    return this.demande?.documents.some(doc => 
      doc.type === documentType && doc.status === 'VALIDE' // Check if the document exists and is validated
    ) ?? false; // Return false if no demande or documents are available
  }
}