// Import required modules and services
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  styleUrls: ['./demande-view.component.css']
})
export class DemandeViewComponent implements OnInit {
  // Basic component properties
  demande?: Demande;
  rejectReason: string = '';
  loading: boolean = true;
  error?: string;

  // Enums and types for the view
  stageTypes = StageType;
  uploadedFile?: File;
  selectedDocumentType?: DocumentType;
  documentTypes = Object.values(DocumentType);
  demandeStatus = DemandeStatus;
  userRole?: RoleType;
  currentFilter: string = '';
  showRejectForm: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private demandeService: DemandeService,
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {
    // Get filter from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.currentFilter = navigation.extras.state['filter'];
    }
  }

  // Initialize component data
  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUser()?.type;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDemandeDetails(parseInt(id));
    }
  }

  // Load demande details from server
  private loadDemandeDetails(id: number): void {
    this.demandeService.getDemandeDetails(id).subscribe({
      next: (data) => {
        this.demande = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des détails de la demande';
        this.loading = false;
      }
    });
  }

  // Handle file selection for upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile = file;
    }
  }

  // Download document handler
  downloadDocument(documentId: number): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const doc = this.demande?.documents.find(d => d.id === documentId);
        const fileName = doc?.name || `document-${documentId}.pdf`;

        const url = window.URL.createObjectURL(
          new Blob([blob], { type: blob.type || 'application/pdf' })
        );

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      error: (err) => {
        this.error = 'Erreur lors du téléchargement du document';
        console.error('Download error:', err);
      }
    });
  }

  // Upload signed document
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
          this.loadDemandeDetails(this.demande!.id);
        },
        error: () => {
          this.error = 'Erreur lors du téléchargement du document';
        }
      });
    }
  }

  // Validate or reject demande
  validateDemande(): void {
    if (this.demande) {
      this.demandeService.validateDemande(this.demande.id).subscribe({
        next: () => {
          this.demande!.status = DemandeStatus.VALIDE;
        },
        error: () => {
          this.error = 'Erreur lors de la validation de la demande';
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
        error: () => {
          this.error = 'Erreur lors du rejet de la demande';
        }
      });
    }
  }

  // Document validation handlers
  validateDocument(documentId: number): void {
    this.documentService.validateDocument(documentId).subscribe({
      next: () => {
        const doc = this.demande?.documents.find(d => d.id === documentId);
        if (doc) {
          doc.status = DocumentStatus.VALIDE;
        }
      },
      error: () => {
        this.error = 'Erreur lors de la validation du document';
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
        error: () => {
          this.error = 'Erreur lors du rejet du document';
        }
      });
    }
  }

  // Get available document types based on user role and filter
  getAvailableDocumentTypes(): DocumentType[] {
    if (!this.userRole) return [];

    const filter = this.currentFilter;

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

      case 'attestation_en_attente':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE ?
        [DocumentType.ATTESTATION] : [];

      default:
        return [];
    }
  }

  // UI visibility control methods
  shouldShowUpload(): boolean {
    if (!this.demande || !this.userRole) return false;

    switch (this.currentFilter) {
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

      case 'attestation_en_attente':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE;

      default:
        return false;
    }
  }

  shouldShowValidateDocument(documentType?: DocumentType): boolean {
    if (!this.demande || !this.userRole) return false;

    const relevantDoc = this.demande.documents
      .filter(d => d.type === documentType)
      .sort((a, b) => b.id - a.id)[0];

    switch (this.currentFilter) {
      case 'bulletin_recus':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE &&
          documentType === DocumentType.BULLETIN_DE_MOUVEMENT_REMPLIE &&
          relevantDoc?.status === DocumentStatus.SOUMIS;

      case 'stagiaire_en_attente':
        return this.userRole === RoleType.DCRH &&
          documentType === DocumentType.CLASSEMENT &&
          relevantDoc?.status === DocumentStatus.SOUMIS;

      case 'convocation_recus':
        return this.userRole === RoleType.CENTRE_DE_FORMATION &&
          documentType === DocumentType.CONVOCATION_SIGNER &&
          relevantDoc?.status === DocumentStatus.SOUMIS;

      default:
        return false;
    }
  }

  shouldShowRejectDocument(documentType: DocumentType): boolean {
    if (!this.demande || !this.userRole) return false;

    switch (this.currentFilter) {
      case 'bulletin_recus':
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE &&
          documentType === DocumentType.BULLETIN_DE_MOUVEMENT_REMPLIE;

      case 'convocation_recus':
        const relevantDoc = this.demande.documents.find(d => d.type === DocumentType.CONVOCATION_SIGNER);
        return this.userRole === RoleType.CENTRE_DE_FORMATION &&
          documentType === DocumentType.CONVOCATION_SIGNER &&
          relevantDoc?.status !== DocumentStatus.VALIDE;

      default:
        return false;
    }
  }

  shouldShowValidateDemande(): boolean {
    if (!this.demande || !this.userRole) return false;

    const filter = this.currentFilter;
    const hasRequiredDocument = this.demande.documents.some(
      doc => doc.type === DocumentType.DEMANDE_DE_STAGE_SINGER
    );

    return filter === 'demande_en_attente' && 
            this.userRole === RoleType.ENCADRANT && 
            hasRequiredDocument;
  }

  shouldShowRejectDemande(): boolean {
    if (!this.demande || !this.userRole) return false;

    const filter = this.currentFilter;
    return filter === 'demande_en_attente' && this.userRole === RoleType.ENCADRANT;
  }

  toggleRejectForm(documentId: number): void {
    this.showRejectForm[documentId] = !this.showRejectForm[documentId];
  }
}
