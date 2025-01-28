import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../../services/demande.service';
import { DocumentService } from '../../../services/document.service';
import { Demande } from '../../../classes/demande';
import { DemandeStatus } from '../../../classes/enums/demande-status';
import { StageType } from '../../../classes/enums/stage-type';
import { DocumentType } from '../../../classes/enums/document-type';
import { RoleType } from '../../../classes/enums/role-type';
import { AuthService } from '../../../services/auth.service';
import { DocumentStatus } from '../../../classes/enums/document-status';

@Component({
  selector: 'app-demande-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-view.component.html',
  styleUrl: './demande-view.component.css'
})
export class DemandeViewComponent implements OnInit {
  demande?: Demande;
  rejectReason: string = '';
  loading: boolean = true;
  error?: string;
  stageTypes = StageType;
  uploadedFile?: File;
  selectedDocumentType?: DocumentType;
  documentTypes = Object.values(DocumentType);
  demandeStatus = DemandeStatus; // Make enum available to template
  userRole?: RoleType;

  constructor(
    private route: ActivatedRoute,
    private demandeService: DemandeService,
    private documentService: DocumentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUser()?.type;
    console.log("role", this.userRole);
    console.log("user", this.authService.getCurrentUser());
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDemandeDetails(parseInt(id));
    }
  }

  private loadDemandeDetails(id: number): void {
    this.demandeService.getDemandeDetails(id).subscribe({
      next: (data) => {
        this.demande = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading demande details';
        this.loading = false;
      }
    });
  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile = file;
    }
  }

  downloadDocument(documentId: number): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        // Get the document from the demande object
        const doc = this.demande?.documents.find(d => d.id === documentId);
        const fileName = doc?.name || `document-${documentId}.pdf`; // Add default extension

        // Create blob URL with the correct content type
        const url = window.URL.createObjectURL(
          new Blob([blob], {
            type: blob.type || 'application/pdf' // Use the blob's type or default to PDF
          })
        );

        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      error: (err) => {
        this.error = 'Error downloading document';
        console.error('Download error:', err);
      }
    });
  }

  uploadSignedDocument(): void {
    if (this.demande && this.uploadedFile && this.selectedDocumentType) {
      this.documentService.uploadDocument(
        this.demande.id,
        this.uploadedFile,
        this.selectedDocumentType
      ).subscribe({
        next: () => {
          this.uploadedFile = undefined;
          this.selectedDocumentType = undefined;
          this.loadDemandeDetails(this.demande!.id); // Refresh to show new document
        },
        error: (err) => {
          this.error = 'Error uploading document';
        }
      });
    }
  }

  validateDemande(): void {
    if (this.demande) {
      this.documentService.validateDocument(this.demande.id).subscribe({
        next: () => {
          this.demande!.status = DemandeStatus.VALIDE;
        },
        error: (err) => {
          this.error = 'Error validating demande';
        }
      });
    }
  }

  rejectDemande(): void {
    if (this.demande && this.rejectReason) {
      this.demandeService.rejectDemande(this.demande.id, this.rejectReason).subscribe({
        next: () => {
          this.demande!.status = DemandeStatus.REJETEE;
        },
        error: (err) => {
          this.error = 'Error rejecting demande';
        }
      });
    }
  }


  validateDocument(documentId: number): void {
    this.documentService.validateDocument(documentId).subscribe({
      next: () => {
        const doc = this.demande?.documents.find(d => d.id === documentId);
        if (doc) {
          doc.status = DocumentStatus.VALIDE;
        }
      },
      error: (err) => {
        this.error = 'Error validating document';
      }
    });
  }

  rejectDocument(documentId: number): void {
    if (this.rejectReason) {
      this.documentService.rejectDocument(documentId, this.rejectReason).subscribe({
        next: () => {
          const doc = this.demande?.documents.find(d => d.id === documentId);
          if (doc) {
            doc.status = DocumentStatus.REJETE;
          }
        },
        error: (err) => {
          this.error = 'Error rejecting document';
        }
      });
    }
  }

  get availableDocumentTypes(): DocumentType[] {
    if (!this.userRole) return [];

    switch (this.userRole) {
      case RoleType.SERVICE_ADMINISTRATIVE:
        return [
          DocumentType.CLASSEMENT,
          DocumentType.BULLETIN_DE_MOUVEMENT_VIDE
        ];

      case RoleType.CENTRE_DE_FORMATION:
        return [
          DocumentType.CONVOCATION,
          DocumentType.LAISSER_PASSER,
          DocumentType.PRISE_DE_SERVICE
        ];

      case RoleType.ENCADRANT:
        return [
          DocumentType.DEMANDE_DE_STAGE_SINGER,
          DocumentType.RAPPORT_SIGNE
        ];

      default:
        return [];
    }
  }





  
  shouldShowUpload(): boolean {
    if (!this.demande || !this.userRole) return false;

    const filter = this.route.snapshot.queryParams['filter'];

    switch (filter) {
      case 'demande_en_attente':
        return this.userRole === RoleType.ENCADRANT;

      case 'rapport_en_attente':
        return this.userRole === RoleType.ENCADRANT;

      case 'classement_en_attente':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE;

      case 'bulletin_en_attente':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE;

      case 'convocation_en_attente':
        return this.userRole === RoleType.CENTRE_DE_FORMATION;

      case 'document_en_attente':
        return this.userRole === RoleType.CENTRE_DE_FORMATION;

      default:
        return false;
    }
  }

  shouldShowValidateDocument(documentType?: DocumentType): boolean {
    if (!this.demande || !this.userRole || !documentType) return false;

    const filter = this.route.snapshot.queryParams['filter'];

    switch (filter) {
      case 'bulletin_recus':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE &&
          documentType === DocumentType.BULLETIN_DE_MOUVEMENT_REMPLIE;

      case 'stagiaire_en_attente':
        return this.userRole === RoleType.DCRH &&
          documentType === DocumentType.CLASSEMENT;

      case 'convocation_recus':
        return this.userRole === RoleType.CENTRE_DE_FORMATION &&
          documentType === DocumentType.CONVOCATION_SIGNER;

      case 'document_en_attente':
        return this.userRole === RoleType.CENTRE_DE_FORMATION;

      default:
        return false;
    }
  }

  shouldShowRejectDocument(documentType: DocumentType): boolean {
    if (!this.demande || !this.userRole) return false;

    const filter = this.route.snapshot.queryParams['filter'];

    switch (filter) {
      case 'bulletin_recus':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE &&
          documentType === DocumentType.BULLETIN_DE_MOUVEMENT_REMPLIE;

      case 'convocation_recus':
        return this.userRole === RoleType.CENTRE_DE_FORMATION &&
          documentType === DocumentType.CONVOCATION_SIGNER;

      default:
        return false;
    }
  }

  shouldShowValidateDemande(): boolean {
    if (!this.demande || !this.userRole) return false;

    const filter = this.route.snapshot.queryParams['filter'];
    return filter === 'demande_en_attente' && this.userRole === RoleType.ENCADRANT;
  }

  shouldShowRejectDemande(): boolean {
    if (!this.demande || !this.userRole) return false;

    const filter = this.route.snapshot.queryParams['filter'];
    return filter === 'demande_en_attente' && this.userRole === RoleType.ENCADRANT;
  }

  getAvailableDocumentTypes(): DocumentType[] {
    if (!this.userRole) return [];

    const filter = this.route.snapshot.queryParams['filter'];

    switch (filter) {
      case 'demande_en_attente':
        return this.userRole === RoleType.ENCADRANT ?
          [DocumentType.DEMANDE_DE_STAGE_SINGER] : [];

      case 'rapport_en_attente':
        return this.userRole === RoleType.ENCADRANT ?
          [DocumentType.RAPPORT_SIGNE] : [];

      case 'classement_en_attente':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE ?
          [DocumentType.CLASSEMENT] : [];

      case 'bulletin_en_attente':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE ?
          [DocumentType.BULLETIN_DE_MOUVEMENT_VIDE] : [];

      case 'convocation_en_attente':
        return this.userRole === RoleType.CENTRE_DE_FORMATION ?
          [DocumentType.CONVOCATION] : [];

      case 'document_en_attente':
        return this.userRole === RoleType.CENTRE_DE_FORMATION ?
          [DocumentType.LAISSER_PASSER, DocumentType.PRISE_DE_SERVICE] : [];

      default:
        return [];
    }
  }
}
