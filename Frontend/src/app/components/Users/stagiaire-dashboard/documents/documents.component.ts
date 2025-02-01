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
          this.laisserPasserDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.LAISSER_PASSER
          ) || null;
          this.bulletinMouvementDoc = stagiaireDemande.documents.find(
            doc => doc.type === DocumentType.BULLETIN_DE_MOUVEMENT
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

  downloadLaisserPasser(): void {
    this.downloadDocument(this.laisserPasserDoc, 'Laisser_Passer.pdf');
  }

  downloadBulletinMouvement(): void {
    this.downloadDocument(this.bulletinMouvementDoc, 'Bulletin_de_Mouvement.pdf');
  }
}
