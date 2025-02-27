import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../services/document.service';
import { DemandeService } from '../../../../services/demande.service';
import { AuthService } from '../../../../services/auth.service';
import { DocumentType } from '../../../../classes/enums/document-type';
import { Demande } from '../../../../classes/demande';
import { Document } from '../../../../classes/document';

@Component({
  selector: 'app-convocation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './convocation.component.html',
  styleUrls: ['./convocation.component.css']
})
export class ConvocationComponent implements OnInit {
  isLoading = true; 
  error: string | null = null; 
  convocationDoc: Document | null = null; 
  convocationSigneeDoc: Document | null = null; 
  selectedFile: File | null = null; 
  uploadError: string | null = null;
  uploadSuccess = false;
  private demandeId: number | null = null; 

  constructor(
    private documentService: DocumentService,
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.loadConvocationDocuments(); // Load convocation documents
  }

  // Load convocation documents for the current user
  private loadConvocationDocuments(): void {
    const stagiaire = this.authService.getCurrentUser(); // Get the current user
    if (!stagiaire) {
      this.error = "Utilisateur non authentifié"; // Show an error message if the user is not authenticated
      this.isLoading = false; // Stop the loading indicator
      return;
    }

    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        // Find the demande associated with the current user
        const stagiaireDemande = demandes.find(d => d.stagiaire.id === stagiaire.id);
        if (stagiaireDemande) {
          this.demandeId = stagiaireDemande.id; // Store the demande ID
          // Find the convocation document
          this.convocationDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.CONVOCATION
          ) || null;
          // Find the signed convocation document
          this.convocationSigneeDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.CONVOCATION_SIGNER
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

  // Handle file selection for upload
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement; // Get the file input element
    if (input.files?.length) {
      this.selectedFile = input.files[0]; // Store the selected file
      this.uploadError = null; // Clear any previous upload errors
    }
  }

  // Download the convocation document
  downloadConvocation(): void {
    if (!this.convocationDoc) return; // Do nothing if no convocation document exists

    this.documentService.downloadDocument(this.convocationDoc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob); // Create a temporary URL for the file
        const link = document.createElement('a'); // Create a link element
        link.href = url; // Set the link's URL
        link.download = 'Convocation.pdf'; // Set the file name for download
        link.click(); // Simulate a click to start the download
        window.URL.revokeObjectURL(url); // Release the temporary URL
      },
      error: (err) => {
        this.error = "Erreur lors du téléchargement"; // Show an error message
      }
    });
  }

  // Upload the signed convocation document
  uploadSignedConvocation(): void {
    if (!this.selectedFile || !this.convocationDoc || !this.demandeId) {
      this.uploadError = "Veuillez sélectionner un fichier"; // Show an error message if no file is selected
      return;
    }

    // Use the demande ID to upload the signed convocation document
    this.documentService.uploadDocument(this.demandeId, this.selectedFile, DocumentType.CONVOCATION_SIGNER)
      .subscribe({
        next: () => {
          this.uploadSuccess = true; // Indicate that the upload was successful
          this.uploadError = null; // Clear any previous upload errors
          this.loadConvocationDocuments(); // Reload the convocation documents
        },
        error: (err) => {
          this.uploadError = "Erreur lors du téléversement"; // Show an error message
        }
      });
  }
}