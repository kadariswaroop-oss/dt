import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BreedService } from '../breed.service';
import { BreedMetadata } from '../types';

@Component({
  selector: 'app-breed-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './breed-info.component.html',
  styleUrl: './breed-info.component.scss',
})
export class BreedInfoComponent implements OnInit {
  breeds: BreedMetadata[] = [];
  filteredBreeds: BreedMetadata[] = [];
  searchTerm = '';
  categoryFilter = 'All';
  selectedBreed: BreedMetadata | null = null;

  constructor(private readonly breedService: BreedService) {}

  ngOnInit(): void {
    this.breedService.getBreeds().subscribe({
      next: (breeds) => {
        this.breeds = breeds;
        this.filteredBreeds = breeds;
        this.selectedBreed = breeds[0] ?? null;
      },
      error: () => {
        this.breeds = [];
        this.filteredBreeds = [];
      },
    });
  }

  applyFilters(): void {
    this.filteredBreeds = this.breeds.filter((breed) => {
      const matchesCategory =
        this.categoryFilter === 'All' || breed.category === this.categoryFilter;
      const matchesSearch = breed.display_name
        .toLowerCase()
        .includes(this.searchTerm.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (!this.filteredBreeds.length) {
      this.selectedBreed = null;
      return;
    }

    if (!this.selectedBreed || !this.filteredBreeds.some((breed) => breed.name === this.selectedBreed?.name)) {
      this.selectedBreed = this.filteredBreeds[0];
    }
  }
}
