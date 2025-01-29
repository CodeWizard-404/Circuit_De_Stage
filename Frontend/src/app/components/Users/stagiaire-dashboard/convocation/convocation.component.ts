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
  private demandeId: number | null = null;  // Add this line to store demandeId

  constructor(
    private documentService: DocumentService,
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConvocationDocuments();
  }

  private loadConvocationDocuments(): void {
    const stagiaire = this.authService.getCurrentUser();
    if (!stagiaire) {
      this.error = "Utilisateur non authentifié";
      this.isLoading = false;
      return;
    }

    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        const stagiaireDemande = demandes.find(d => d.stagiaire.id === stagiaire.id);
        if (stagiaireDemande) {
          this.demandeId = stagiaireDemande.id;  // Store the demandeId
          this.convocationDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.CONVOCATION
          ) || null;
          this.convocationSigneeDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.CONVOCATION_SIGNER
          ) || null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des documents";
        this.isLoading = false;
        console.error('Error loading documents:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.uploadError = null;
    }
  }

  downloadConvocation(): void {
    if (!this.convocationDoc) return;

    this.documentService.downloadDocument(this.convocationDoc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Convocation.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = "Erreur lors du téléchargement";
        console.error('Download error:', err);
      }
    });
  }

  uploadSignedConvocation(): void {
    if (!this.selectedFile || !this.convocationDoc || !this.demandeId) {
      this.uploadError = "Veuillez sélectionner un fichier";
      return;
    }

    // Use demandeId instead of document.id
    this.documentService.uploadDocument(this.demandeId, this.selectedFile, DocumentType.CONVOCATION_SIGNER)
      .subscribe({
        next: () => {
          this.uploadSuccess = true;
          this.uploadError = null;
          this.loadConvocationDocuments();
        },
        error: (err) => {
          this.uploadError = "Erreur lors du téléversement";
          console.error('Upload error:', err);
        }
      });
  }
}
