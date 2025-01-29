import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../services/document.service';
import { DemandeService } from '../../../../services/demande.service';
import { AuthService } from '../../../../services/auth.service';
import { DocumentType } from '../../../../classes/enums/document-type';
import { Document } from '../../../../classes/document';
import { Demande } from '../../../../classes/demande';
import { DocumentStatus } from '../../../../classes/enums/document-status';

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
  bulletinVide: Document | null = null;
  bulletinRempli: Document | null = null;
  rapport: Document | null = null;
  rapportSigne: Document | null = null;
  attestation: Document | null = null;
  selectedRapport: File | null = null;
  selectedBulletin: File | null = null;
  bulletinRempliStatus: string | null = null;
  private demandeId: number | null = null;

  constructor(
    private documentService: DocumentService,
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  private loadDocuments(): void {
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
          this.demandeId = stagiaireDemande.id;
          this.bulletinVide = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.BULLETIN_DE_MOUVEMENT_VIDE
          ) || null;
          this.bulletinRempli = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.BULLETIN_DE_MOUVEMENT_REMPLIE
          ) || null;
          if (this.bulletinRempli) {
            this.bulletinRempliStatus = this.bulletinRempli.status === DocumentStatus.VALIDE ? 'Validé' : 'Soumis';
          }
          this.rapport = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.RAPPORT
          ) || null;
          this.rapportSigne = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.RAPPORT_SIGNE
          ) || null;
          this.attestation = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.ATTESTATION
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

  onRapportSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedRapport = input.files[0];
    }
  }

  onBulletinSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedBulletin = input.files[0];
    }
  }

  uploadRapport(): void {
    if (!this.selectedRapport || !this.demandeId) return;

    this.documentService.uploadDocument(this.demandeId, this.selectedRapport, DocumentType.RAPPORT)
      .subscribe({
        next: () => {
          this.loadDocuments();
          this.selectedRapport = null;
        },
        error: (err) => {
          this.error = "Erreur lors du téléversement du rapport";
          console.error('Upload error:', err);
        }
      });
  }

  uploadBulletin(): void {
    if (!this.selectedBulletin || !this.demandeId) return;

    this.documentService.uploadDocument(this.demandeId, this.selectedBulletin, DocumentType.BULLETIN_DE_MOUVEMENT_REMPLIE)
      .subscribe({
        next: () => {
          this.loadDocuments();
          this.selectedBulletin = null;
        },
        error: (err) => {
          this.error = "Erreur lors du téléversement du bulletin";
          console.error('Upload error:', err);
        }
      });
  }

  downloadDocument(doc: Document | null, filename: string): void {
    if (!doc) return;

    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = "Erreur lors du téléchargement";
        console.error('Download error:', err);
      }
    });
  }
}
