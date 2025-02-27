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
      this.currentFilter = navigation.extras.state['filter']; // Retrieve the filter passed during navigation
    }
  }

  // Initialize component data when the component loads
  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUser()?.type; // Get the current user's role
    const id = this.route.snapshot.paramMap.get('id'); // Get the ID of the demande from the URL
    if (id) {
      this.loadDemandeDetails(parseInt(id)); // Load details of the demande using the ID
    }
  }

  // Load demande details from the server
  private loadDemandeDetails(id: number): void {
    this.demandeService.getDemandeDetails(id).subscribe({
      next: (data) => {
        this.demande = data; // Store the fetched demande details
        this.loading = false; // Stop the loading indicator
      },
      error: () => {
        this.error = 'Erreur lors du chargement des détails de la demande'; 
        this.loading = false; // Stop the loading indicator
      }
    });
  }

  // Handle file selection for upload
  onFileSelected(event: any): void {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      this.uploadedFile = file; // Store the file for later use
    }
  }

  // Download a document
  downloadDocument(documentId: number): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const doc = this.demande?.documents.find(d => d.id === documentId); // Find the document by ID
        const fileName = doc?.name || `document-${documentId}.pdf`; // Use the document name or a default name

        const url = window.URL.createObjectURL(
          new Blob([blob], { type: blob.type || 'application/pdf' }) // Create a temporary URL for the file
        );

        const link = document.createElement('a'); // Create a link element
        link.href = url; // Set the link's URL
        link.download = fileName; // Set the file name for download
        document.body.appendChild(link); // Add the link to the DOM
        link.click(); // Simulate a click to start the download

        setTimeout(() => {
          document.body.removeChild(link); // Remove the link from the DOM
          window.URL.revokeObjectURL(url); // Release the temporary URL
        }, 100);
      },
      error: (err) => {
        this.error = 'Erreur lors du téléchargement du document'; // Show an error message
        console.error('Download error:', err); // Log the error to the console
      }
    });
  }

  // Upload a signed document
  uploadSignedDocument(): void {
    if (this.demande && this.uploadedFile && this.selectedDocumentType) {
      this.documentService.uploadDocument(
        this.demande.id, // ID of the demande
        this.uploadedFile, // File to upload
        this.selectedDocumentType // Type of the document
      ).subscribe({
        next: () => {
          this.uploadedFile = undefined; // Clear the uploaded file
          this.selectedDocumentType = undefined; // Clear the selected document type
          this.loadDemandeDetails(this.demande!.id); // Reload the demande details
        },
        error: () => {
          this.error = 'Erreur lors du téléchargement du document'; // Show an error message
        }
      });
    }
  }

  // Validate a demande
  validateDemande(): void {
    if (this.demande) {
      this.demandeService.validateDemande(this.demande.id).subscribe({
        next: () => {
          this.demande!.status = DemandeStatus.VALIDE; // Update the status to "Validated"
        },
        error: () => {
          this.error = 'Erreur lors de la validation de la demande'; // Show an error message
        }
      });
    }
  }

  // Reject a demande
  rejectDemande(): void {
    if (this.demande && this.rejectReason) {
      this.demandeService.rejectDemande(this.demande.id, this.rejectReason).subscribe({
        next: () => {
          this.demande!.status = DemandeStatus.REJETEE; // Update the status to "Rejected"
        },
        error: () => {
          this.error = 'Erreur lors du rejet de la demande'; // Show an error message
        }
      });
    }
  }

  // Validate a document
  validateDocument(documentId: number): void {
    this.documentService.validateDocument(documentId).subscribe({
      next: () => {
        const doc = this.demande?.documents.find(d => d.id === documentId); // Find the document by ID
        if (doc) {
          doc.status = DocumentStatus.VALIDE; // Update the document status to "Validated"
        }
      },
      error: () => {
        this.error = 'Erreur lors de la validation du document'; // Show an error message
      }
    });
  }

  // Reject a document
  rejectDocument(documentId: number): void {
    if (this.rejectReason) {
      this.documentService.rejectDocument(documentId, this.rejectReason).subscribe({
        next: () => {
          const doc = this.demande?.documents.find(d => d.id === documentId); // Find the document by ID
          if (doc) {
            doc.status = DocumentStatus.REJETE; // Update the document status to "Rejected"
          }
        },
        error: () => {
          this.error = 'Erreur lors du rejet du document'; // Show an error message
        }
      });
    }
  }

  // Get available document types based on user role and filter
  getAvailableDocumentTypes(): DocumentType[] {
    if (!this.userRole) return []; // Return an empty list if no user role is set

    const filter = this.currentFilter; // Get the current filter

    switch (filter) {
      case 'demande_en_attente': // If the filter is "Demande Pending"
        return this.userRole === RoleType.ENCADRANT ? // Check if the user is an "Encadrant"
          [DocumentType.DEMANDE_DE_STAGE_SIGNER] : []; // Return the relevant document type

      case 'rapport_en_attente': // If the filter is "Report Pending"
        return this.userRole === RoleType.ENCADRANT ?
          [DocumentType.RAPPORT_SIGNE] : [];

      case 'classement_en_attente': // If the filter is "Classement Pending"
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE ?
          [DocumentType.CLASSEMENT] : [];

      case 'bulletin_en_attente': // If the filter is "Bulletin Pending"
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE ?
          [DocumentType.BULLETIN_DE_MOUVEMENT] : [];

      case 'convocation_en_attente': // If the filter is "Convocation Pending"
        return this.userRole === RoleType.CENTRE_DE_FORMATION ?
          [DocumentType.CONVOCATION] : [];

      case 'document_en_attente': // If the filter is "Document Pending"
        return this.userRole === RoleType.CENTRE_DE_FORMATION ?
          [DocumentType.LAISSER_PASSER, DocumentType.PRISE_DE_SERVICE] : [];

      case 'attestation_en_attente': // If the filter is "Attestation Pending"
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE ?
          [DocumentType.ATTESTATION] : [];

      default:
        return []; // Return an empty list for unknown filters
    }
  }

  // UI visibility control methods
  shouldShowUpload(): boolean {
    if (!this.demande || !this.userRole) return false; // Hide if no demande or user role is set

    switch (this.currentFilter) {
      case 'demande_en_attente': // Show upload button for "Demande Pending" if user is Encadrant
        return this.userRole === RoleType.ENCADRANT;

      case 'rapport_en_attente': // Show upload button for "Report Pending" if user is Encadrant
        return this.userRole === RoleType.ENCADRANT;

      case 'classement_en_attente': // Show upload button for "Classement Pending" if user is Admin
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE;

      case 'document_en_attente': // Show upload button for "Document Pending" if user is Formation Center
        return this.userRole === RoleType.CENTRE_DE_FORMATION;

      case 'bulletin_en_attente': // Show upload button for "Bulletin Pending" if user is Admin
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE;

      case 'convocation_en_attente': // Show upload button for "Convocation Pending" if user is Formation Center
        return this.userRole === RoleType.CENTRE_DE_FORMATION;

      case 'attestation_en_attente': // Show upload button for "Attestation Pending" if user is Admin
        return this.userRole === RoleType.SERVICE_ADMINISTRATIVE;

      default:
        return false; // Hide upload button for unknown filters
    }
  }

  shouldShowValidateDocument(documentType?: DocumentType): boolean {
    if (!this.demande || !this.userRole) return false; // Hide if no demande or user role is set

    const relevantDoc = this.demande.documents
      .filter(d => d.type === documentType) // Filter documents by type
      .sort((a, b) => b.id - a.id)[0]; // Get the latest document of the type

    switch (this.currentFilter) {
      case 'stagiaire_en_attente': // Show validate button for "Stagiaire Pending" if user is DCRH
        return this.userRole === RoleType.DCRH &&
          documentType === DocumentType.CLASSEMENT &&
          relevantDoc?.status === DocumentStatus.SOUMIS;

      case 'convocation_recus': // Show validate button for "Convocation Received" if user is Formation Center
        return this.userRole === RoleType.CENTRE_DE_FORMATION &&
          documentType === DocumentType.CONVOCATION_SIGNER &&
          relevantDoc?.status === DocumentStatus.SOUMIS;

      default:
        return false; // Hide validate button for unknown filters
    }
  }

  shouldShowRejectDocument(documentType: DocumentType): boolean {
    if (!this.demande || !this.userRole) return false; // Hide if no demande or user role is set

    switch (this.currentFilter) {
      case 'convocation_recus': // Show reject button for "Convocation Received" if user is Formation Center
        const relevantDoc = this.demande.documents.find(d => d.type === DocumentType.CONVOCATION_SIGNER);
        return this.userRole === RoleType.CENTRE_DE_FORMATION &&
          documentType === DocumentType.CONVOCATION_SIGNER &&
          relevantDoc?.status !== DocumentStatus.VALIDE;

      default:
        return false; // Hide reject button for unknown filters
    }
  }

  shouldShowValidateDemande(): boolean {
    if (!this.demande || !this.userRole) return false; // Hide if no demande or user role is set

    const filter = this.currentFilter;
    const hasRequiredDocument = this.demande.documents.some(
      doc => doc.type === DocumentType.DEMANDE_DE_STAGE_SIGNER // Check if the required document exists
    );

    return filter === 'demande_en_attente' && // Show validate button for "Demande Pending"
      this.userRole === RoleType.ENCADRANT && // Only for Encadrants
      hasRequiredDocument; // Only if the required document exists
  }

  shouldShowRejectDemande(): boolean {
    if (!this.demande || !this.userRole) return false; // Hide if no demande or user role is set

    const filter = this.currentFilter;
    return filter === 'demande_en_attente' && // Show reject button for "Demande Pending"
      this.userRole === RoleType.ENCADRANT; // Only for Encadrants
  }

  // Toggle visibility of the reject form for a specific document
  toggleRejectForm(documentId: number): void {
    this.showRejectForm[documentId] = !this.showRejectForm[documentId]; // Toggle the visibility
  }
}