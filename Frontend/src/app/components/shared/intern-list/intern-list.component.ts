import { Component, OnInit } from '@angular/core'; 
import { StageType } from '../../../classes/enums/stage-type'; 
import { DemandeService } from '../../../services/demande.service';
import { Demande } from '../../../classes/demande'; 
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { DocumentType } from '../../../classes/enums/document-type';
import { AuthService } from '../../../services/auth.service';
import { DocumentStatus } from '../../../classes/enums/document-status'; 
import { Document } from '../../../classes/document';

@Component({
  selector: 'app-intern-list', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './intern-list.component.html', 
  styleUrls: ['./intern-list.component.css'] 
})
export class InternListComponent implements OnInit {
  demande: Demande[] = [];
  filtered: Demande[] = []; 
  documentFiltered: Demande[] = []; 
  stageTypes = Object.values(StageType); 
  years: number[] = [2021, 2022, 2023, 2024, 2025];
  searchName: string = ''; 
  selectedStageType: StageType | null = null; 
  selectedYear: number | null = null; 
  currentFilter: string = ''; 

  constructor(
    private demandeService: DemandeService, 
    private router: Router,
    private route: ActivatedRoute, 
    private authService: AuthService 
  ) { }

  ngOnInit(): void {
    // Subscribe to query parameters from the URL
    this.route.queryParams.subscribe(params => {
      this.currentFilter = params['filter'] || ''; // Get the 'filter' parameter or default to empty
      this.loadInterns(); // Load interns based on the filter
    });
  }

  // Fetch all demands from the service and apply filters
  loadInterns(): void {
    this.demandeService.getAllDemandes().subscribe((data: Demande[]) => {
      this.demande = data; // Store all fetched demands
      if (this.currentFilter) {
        // Filter demands based on the current filter and their documents
        this.documentFiltered = this.demande.filter(demande =>
          this.shouldIncludeDemande(demande.documents || [], this.currentFilter)
        );
      } else {
        this.documentFiltered = this.demande; // No filter, use all demands
      }
      this.applyAdditionalFilters(); // Apply additional filters like name, stage type, and year
    });
  }

  // Apply additional filters (name, stage type, year) to the filtered list
  private applyAdditionalFilters(): void {
    this.filtered = this.documentFiltered;

    if (this.searchName || this.selectedStageType || this.selectedYear) {
      this.filtered = this.filtered.filter(demande => {
        // Check if the intern's name matches the search input
        const matchesName = !this.searchName ||
          demande.stagiaire.nom.toLowerCase().includes(this.searchName.toLowerCase()) ||
          demande.stagiaire.prenom.toLowerCase().includes(this.searchName.toLowerCase());

        // Check if the stage type matches the selected stage type
        const matchesStageType = !this.selectedStageType ||
          demande.stage === this.selectedStageType;

        // Check if the year matches the selected year
        const demandeYear = new Date(demande.debutStage).getFullYear();
        const matchesYear = !this.selectedYear ||
          demandeYear === Number(this.selectedYear);

        // Return true only if all conditions match
        return matchesName && matchesStageType && matchesYear;
      });
    }
  }

  // Triggered when the search input changes
  onSearchChange(): void {
    this.applyAdditionalFilters(); // Reapply filters when search input changes
  }

  // Triggered when a filter dropdown changes
  onFilterChange(): void {
    this.applyAdditionalFilters(); // Reapply filters when a dropdown filter changes
  }

  // Determine if a demand should be included based on its documents and the current filter
  private shouldIncludeDemande(documents: Document[], filter: string): boolean {
    // Helper function to check if a document exists with a specific type and optional status
    const hasDocument = (type: DocumentType, status?: DocumentStatus) =>
      documents.some(doc =>
        doc.type.toString() === type.toString() && (!status || doc.status === status)
      );

    // Switch statement to handle different filter cases
    switch (filter) {
      case 'demande_en_attente':
        return hasDocument(DocumentType.DEMANDE_DE_STAGE) &&
          !hasDocument(DocumentType.DEMANDE_DE_STAGE_SIGNER);

      case 'demande_valide':
        return hasDocument(DocumentType.DEMANDE_DE_STAGE_SIGNER) &&
          !hasDocument(DocumentType.RAPPORT);

      case 'rapport_en_attente':
        return hasDocument(DocumentType.RAPPORT) &&
          !hasDocument(DocumentType.RAPPORT_SIGNE);

      case 'rapport_valide':
        return hasDocument(DocumentType.RAPPORT_SIGNE);

      case 'classement_en_attente':
        return hasDocument(DocumentType.DEMANDE_DE_STAGE_SIGNER) &&
          !hasDocument(DocumentType.CLASSEMENT);

      case 'classement_valide':
        return hasDocument(DocumentType.CLASSEMENT) &&
          !hasDocument(DocumentType.PRISE_DE_SERVICE);

      case 'prise_service_en_attente':
        return hasDocument(DocumentType.CLASSEMENT, DocumentStatus.VALIDE) &&
          !hasDocument(DocumentType.PRISE_DE_SERVICE);

      case 'prise_service_valide':
          return hasDocument(DocumentType.PRISE_DE_SERVICE) &&
          !hasDocument(DocumentType.RAPPORT_SIGNE);

      case 'bulletin_en_attente':
        return hasDocument(DocumentType.RAPPORT_SIGNE) &&
          !hasDocument(DocumentType.BULLETIN_DE_MOUVEMENT);

      case 'bulletin_valide':
        return hasDocument(DocumentType.BULLETIN_DE_MOUVEMENT) &&
        !hasDocument(DocumentType.ATTESTATION);

      case 'attestation_en_attente':
        return hasDocument(DocumentType.RAPPORT_SIGNE) &&
        hasDocument(DocumentType.BULLETIN_DE_MOUVEMENT) &&  
        !hasDocument(DocumentType.ATTESTATION);
        
      case 'attestation_valide':
        return hasDocument(DocumentType.ATTESTATION);

      case 'stagiaire_en_attente':
        return hasDocument(DocumentType.CLASSEMENT) &&
          !hasDocument(DocumentType.CLASSEMENT, DocumentStatus.VALIDE);

      case 'stagiaire_valide':
        return hasDocument(DocumentType.CLASSEMENT, DocumentStatus.VALIDE);

      case 'convocation_en_attente':
        return hasDocument(DocumentType.CLASSEMENT, DocumentStatus.VALIDE) &&
          !hasDocument(DocumentType.CONVOCATION);

      case 'convocation_envoyer':
        return hasDocument(DocumentType.CONVOCATION) &&
          !hasDocument(DocumentType.CONVOCATION_SIGNER);

      case 'convocation_recus':
        return hasDocument(DocumentType.CONVOCATION_SIGNER) &&
          !hasDocument(DocumentType.CONVOCATION_SIGNER, DocumentStatus.VALIDE);

      case 'convocation_valide':
        return hasDocument(DocumentType.CONVOCATION_SIGNER, DocumentStatus.VALIDE) &&
          !hasDocument(DocumentType.PRISE_DE_SERVICE);

      case 'document_en_attente':
        return hasDocument(DocumentType.CONVOCATION_SIGNER, DocumentStatus.VALIDE) &&
          !hasDocument(DocumentType.PRISE_DE_SERVICE);

      case 'document_valide':
        return hasDocument(DocumentType.PRISE_DE_SERVICE);

      default:
        return true;
    }
  }

  // Navigate to view details of a specific demand
  viewInternDetails(demandeID: number): void {
    this.router.navigate([`/demande-view/${demandeID}`], {
      state: { filter: this.currentFilter } // Pass the current filter to the next page
    });
  }
}