import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../services/document.service';
import { DemandeService } from '../../../../services/demande.service';
import { AuthService } from '../../../../services/auth.service';
import { DocumentType } from '../../../../classes/enums/document-type';
import { Document } from '../../../../classes/document';
import { Demande } from '../../../../classes/demande';

@Component({
  selector: 'app-fin-du-stage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fin-du-stage.component.html',
  styleUrls: ['./fin-du-stage.component.css']
})
export class FinDuStageComponent implements OnInit {
  isLoading = true;
  error: string | null = null;
  rapport: Document | null = null;
  rapportSigne: Document | null = null;
  attestation: Document | null = null;
  selectedRapport: File | null = null;
  private demandeId: number | null = null;

  constructor(
    private documentService: DocumentService,
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.loadDocuments(); // Load documents for the current user
  }

  // Load documents associated with the current stagiaire (intern)
  private loadDocuments(): void {
    const stagiaire = this.authService.getCurrentUser(); // Get the current user
    if (!stagiaire) {
      this.error = "Utilisateur non authentifié"; // Show an error message if the user is not authenticated
      this.isLoading = false; // Stop the loading indicator
      return;
    }

    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        // Find the demande associated with the current stagiaire
        const stagiaireDemande = demandes.find(d => d.stagiaire.id === stagiaire.id);
        if (stagiaireDemande) {
          this.demandeId = stagiaireDemande.id; // Store the demande ID
          // Find the "Rapport" document
          this.rapport = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.RAPPORT
          ) || null;
          // Find the signed "Rapport" document
          this.rapportSigne = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.RAPPORT_SIGNE
          ) || null;
          // Find the "Attestation" document
          this.attestation = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.ATTESTATION
          ) || null;
        }
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des documents"; // Show an error message
        this.isLoading = false; // Stop the loading indicator
      }
    });
  }

  // Handle file selection for uploading the rapport
  onRapportSelected(event: Event): void {
    const input = event.target as HTMLInputElement; // Get the file input element
    if (input.files?.length) {
      this.selectedRapport = input.files[0]; // Store the selected file
    }
  }

  // Upload the selected rapport document
  uploadRapport(): void {
    if (!this.selectedRapport || !this.demandeId) return; // Do nothing if no file or demande ID is available
    this.documentService.uploadDocument(this.demandeId, this.selectedRapport, DocumentType.RAPPORT)
      .subscribe({
        next: () => {
          this.loadDocuments(); // Reload documents after successful upload
          this.selectedRapport = null; // Clear the selected file
        },
        error: (err) => {
          this.error = "Erreur lors du téléversement du rapport"; // Show an error message
        }
      });
  }

  // Download a specific document
  downloadDocument(doc: Document | null, filename: string): void {
    if (!doc) return; // Do nothing if the document is not available
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob); // Create a temporary URL for the file
        const link = document.createElement('a'); // Create a link element
        link.href = url; // Set the link's URL
        link.download = filename; // Set the file name for download
        link.click(); // Simulate a click to start the download
        window.URL.revokeObjectURL(url); // Release the temporary URL
      },
      error: (err) => {
        this.error = "Erreur lors du téléchargement"; // Show an error message
      }
    });
  }
}