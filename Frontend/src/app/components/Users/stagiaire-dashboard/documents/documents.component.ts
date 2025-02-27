import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../services/document.service';
import { DemandeService } from '../../../../services/demande.service';
import { AuthService } from '../../../../services/auth.service';
import { DocumentType } from '../../../../classes/enums/document-type';
import { Document } from '../../../../classes/document';
import { Demande } from '../../../../classes/demande';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  isLoading = true;
  error: string | null = null;
  laisserPasserDoc: Document | null = null;
  bulletinMouvementDoc: Document | null = null;

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
          // Find the "Laisser Passer" document
          this.laisserPasserDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.LAISSER_PASSER
          ) || null;

          // Find the "Bulletin de Mouvement" document
          this.bulletinMouvementDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.BULLETIN_DE_MOUVEMENT
          ) || null;
        }
        this.isLoading = false; // Stop the loading indicator
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des documents"; // Show an error message
        this.isLoading = false; // Stop the loading indicator
        console.error('Error loading documents:', err); // Log the error for debugging
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
        console.error('Download error:', err); // Log the error for debugging
      }
    });
  }

  // Download the "Laisser Passer" document
  downloadLaisserPasser(): void {
    this.downloadDocument(this.laisserPasserDoc, 'Laisser_Passer.pdf'); // Call the generic download method
  }

  // Download the "Bulletin de Mouvement" document
  downloadBulletinMouvement(): void {
    this.downloadDocument(this.bulletinMouvementDoc, 'Bulletin_de_Mouvement.pdf'); // Call the generic download method
  }
}