import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DemandeService } from '../../../services/demande.service';
import { Router } from '@angular/router';
import { Demande } from '../../../classes/demande';
import { Stagiaire } from '../../../classes/stagiaire';
import { DocumentType } from '../../../classes/enums/document-type';
import { StageType } from '../../../classes/enums/stage-type';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RoleType } from '../../../classes/enums/role-type';
import { DemandeStatus } from '../../../classes/enums/demande-status';

@Component({
  selector: 'app-intern-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './intern-form.component.html',
  styleUrls: ['./intern-form.component.css']
})
export class InternFormComponent {
  isLinear = true;
  documentTypes = Object.values(DocumentType);
  stageTypes = Object.values(StageType);
  documentsMap = new Map<DocumentType, File>();
  requiredDocuments: DocumentType[] = [];
  errorMessage: string = '';
  internForm: FormGroup;
  personalInfo: FormGroup;
  internshipInfo: FormGroup;
  institueInfo: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private router: Router
  ) {
    this.personalInfo = this.fb.group({
      isGroup: [false],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      emailPerso: ['', [Validators.required, Validators.email]],
      tel: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],

      
      nom2: [''],
      prenom2: [''],
      cin2: ['',Validators.pattern(/^\d{8}$/)],
      emailPerso2: ['', Validators.email],
      tel2: ['',Validators.pattern(/^\d{8}$/)]
    });

    this.institueInfo = this.fb.group({
      institut: ['', Validators.required],
      niveau: ['', Validators.required],
      annee: ['', Validators.required],
      specialite: ['', Validators.required],

      specialite2: ['']

    });

    this.internshipInfo = this.fb.group({
      stageType: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });

    this.internForm = this.fb.group({
      personalInfo: this.personalInfo,
      institueInfo: this.institueInfo,
      internshipInfo: this.internshipInfo
    });
  }

  onFileSelected(event: any, type: DocumentType) {
    const file: File = event.target.files[0];
    if (file) {
      this.documentsMap.set(type, file);
    }
  }

  getRequiredDocuments(): void {
    const stageType = this.internshipInfo.get('stageType')?.value as StageType;
    this.requiredDocuments = this.demandeService.getRequiredDocuments(stageType);
  }

  onSubmit() {
    if (this.internForm.valid && this.documentsMap.size > 0) {
      const formValue = this.internForm.value;

      // Create Stagiaire
      const stagiaire = new Stagiaire(
        0, // temp ID
        formValue.personalInfo.nom!,
        formValue.personalInfo.prenom!,
        '', // email will be generated
        '', // password will be generated
        RoleType.STAGIAIRE,
        formValue.personalInfo.emailPerso!,
        Number(formValue.personalInfo.cin!),
        Number(formValue.personalInfo.tel!),
        formValue.institueInfo.institut!,
        formValue.institueInfo.niveau!,
        formValue.institueInfo.annee!,
        formValue.institueInfo.specialite!,
        formValue.personalInfo.emailPerso2,
        formValue.personalInfo.nom2,
        formValue.personalInfo.prenom2,
        Number(formValue.personalInfo.cin2),
        Number(formValue.personalInfo.tel2),
        formValue.institueInfo.specialite2
      );

      // Create Demande
      const demande = {
        id: 0, // temp ID
        stage: formValue.internshipInfo.stageType! as StageType,
        debutStage: new Date(formValue.internshipInfo.dateDebut!),
        finStage: new Date(formValue.internshipInfo.dateFin!),
        status: 'SOUMISE' as DemandeStatus,
        stagiaire,
        encadrant: null, // encadrant will be assigned later
        documents: [] // documents will be added by service
      };

      // Create FormData
      const formData = new FormData();

      // Append the 'demande' part as JSON (flattened)
      formData.append('demande', JSON.stringify(demande));

      // Append files to FormData with keys as DocumentType strings
      this.documentsMap.forEach((file, type) => {
        formData.append(type.toString(), file);
      });

      // Submit the form
      this.demandeService.submitDemande(formData).subscribe({
        next: () => this.router.navigate(['/confirmation']),
        error: (err) => {
          this.errorMessage = err.error?.message || 'A request for this stage type exists.';
          console.error('Submission error:', err);
        },
      });
    }
  }
}
