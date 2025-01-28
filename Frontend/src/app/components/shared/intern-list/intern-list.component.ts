import { Component, OnInit } from '@angular/core';
import { StageType } from '../../../classes/enums/stage-type';
import { Stagiaire } from '../../../classes/stagiaire';
import { StagiaireService } from '../../../services/stagiaire.service';
import { DemandeService } from '../../../services/demande.service';
import { Demande } from '../../../classes/demande';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intern-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './intern-list.component.html',
  styleUrls: ['./intern-list.component.css']
})
export class InternListComponent implements OnInit {
  demande: Demande[] = [];
  filtered: Demande[] = [];
  stageTypes = Object.values(StageType);
  years: number[] = [2021, 2022, 2023, 2024, 2025];  
  searchName: string = '';
  selectedStageType: StageType | null = null;
  selectedYear: number | null = null;

  constructor(private demandeService: DemandeService,private router: Router) {}

  ngOnInit(): void {
    this.loadInterns();
  }

  loadInterns(): void {
    this.demandeService.getAllDemandes().subscribe((data: Demande[]) => {
      this.demande = data;
      this.filtered = [...this.demande];
    });
  }

  onSearchChange(): void {
    this.filterInterns();
  }

  onFilterChange(): void {
    this.filterInterns();
  }

  filterInterns(): void {
    this.filtered = this.demande.filter(demande => {
      const matchesName = demande.stagiaire.nom.toLowerCase().includes(this.searchName.toLowerCase());
      
      const matchesStageType = this.selectedStageType ? demande.stage === this.selectedStageType : true;
      
      const demandeYear = new Date(demande.debutStage).getFullYear();
      const matchesYear = this.selectedYear ? demandeYear === Number(this.selectedYear) : true;
      
      return matchesName && matchesStageType && matchesYear;
    });
  }

  viewInternDetails(demandeID: number): void {
    this.router.navigate([`/demande-view/${demandeID}`]);
  }
}
