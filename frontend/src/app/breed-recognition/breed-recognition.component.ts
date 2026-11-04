import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { BreedService } from '../breed.service';
import { PredictionResponse } from '../types';

@Component({
  selector: 'app-breed-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breed-recognition.component.html',
  styleUrl: './breed-recognition.component.scss',
})
export class BreedRecognitionComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = false;
  prediction: PredictionResponse | null = null;
  errorMessage = '';

  constructor(
    private readonly breedService: BreedService,
    private readonly router: Router,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.prepareFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.prepareFile(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.prediction = null;
    this.errorMessage = '';
  }

  analyze(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please upload an animal image first.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.breedService.predictImage(this.selectedFile).subscribe({
      next: (response) => {
        this.prediction = response;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Prediction failed. Please try another image.';
        this.isLoading = false;
      },
    });
  }

  navigateToHistory(): void {
    this.router.navigateByUrl('/history');
  }

  private prepareFile(file: File): void {
    const validType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    const validSize = file.size <= 5 * 1024 * 1024;

    if (!validType) {
      this.errorMessage = 'Unsupported file type. Use JPG, JPEG, or PNG images only.';
      return;
    }

    if (!validSize) {
      this.errorMessage = 'Image is too large. Please upload a file under 5MB.';
      return;
    }

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.errorMessage = '';
    this.prediction = null;
  }
}
