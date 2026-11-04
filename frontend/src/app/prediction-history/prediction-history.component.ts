import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BreedService } from '../breed.service';
import { PredictionRecord } from '../types';

@Component({
  selector: 'app-prediction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prediction-history.component.html',
  styleUrl: './prediction-history.component.scss',
})
export class PredictionHistoryComponent implements OnInit {
  predictions: PredictionRecord[] = [];
  filteredPredictions: PredictionRecord[] = [];
  searchTerm = '';
  categoryFilter = 'All';
  breedFilter = 'All';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private readonly breedService: BreedService) {}

  ngOnInit(): void {
    this.loadPredictions();
  }

  loadPredictions(): void {
    this.breedService.getPredictions().subscribe({
      next: (predictions) => {
        this.predictions = predictions;
        this.applyFilters();
      },
      error: () => {
        this.predictions = [];
        this.filteredPredictions = [];
      },
    });
  }

  applyFilters(): void {
    const query = this.searchTerm.trim().toLowerCase();

    this.filteredPredictions = [...this.predictions].filter((prediction) => {
      const matchesSearch =
        !query ||
        prediction.breed.toLowerCase().includes(query) ||
        prediction.category.toLowerCase().includes(query);
      const matchesCategory = this.categoryFilter === 'All' || prediction.category === this.categoryFilter;
      const matchesBreed = this.breedFilter === 'All' || prediction.breed === this.breedFilter;
      return matchesSearch && matchesCategory && matchesBreed;
    });

    this.filteredPredictions.sort((a, b) => {
      const left = new Date(a.created_at).getTime();
      const right = new Date(b.created_at).getTime();
      return this.sortDirection === 'asc' ? left - right : right - left;
    });
  }

  deletePrediction(id: number): void {
    this.breedService.deletePrediction(id).subscribe({
      next: () => {
        this.predictions = this.predictions.filter((prediction) => prediction.id !== id);
        this.applyFilters();
      },
      error: () => {
        // Intentionally silent; the UI keeps the current list stable if deletion fails.
      },
    });
  }

  get categories(): string[] {
    return ['All', ...new Set(this.predictions.map((prediction) => prediction.category))];
  }

  get breeds(): string[] {
    return ['All', ...new Set(this.predictions.map((prediction) => prediction.breed))];
  }
}
