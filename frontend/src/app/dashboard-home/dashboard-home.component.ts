import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { BreedService } from '../breed.service';
import { AnalyticsSummary, PredictionRecord } from '../types';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  stats: Array<{ label: string; value: string; meta: string; tone: string }> = [];
  recentPredictions: Array<PredictionRecord & { image: string }> = [];
  isLoading = true;

  constructor(private readonly breedService: BreedService) {}

  ngOnInit(): void {
    forkJoin({
      predictions: this.breedService.getPredictions().pipe(catchError(() => of([]))),
      analytics: this.breedService.getAnalytics().pipe(catchError(() => of({} as AnalyticsSummary))),
    }).subscribe(({ predictions, analytics }) => {
      this.isLoading = false;
      this.recentPredictions = this.buildRecent(predictions);
      this.stats = this.buildStats(analytics, predictions.length);
    });
  }

  private buildStats(analytics: Partial<AnalyticsSummary>, predictionCount: number): Array<{ label: string; value: string; meta: string; tone: string }> {
    const total = analytics.total_predictions ?? predictionCount ?? 0;
    const cattle = analytics.cattle_predictions ?? 0;
    const buffalo = analytics.buffalo_predictions ?? 0;

    return [
      { label: 'Total Predictions', value: String(total), meta: 'Overall image scans', tone: 'emerald' },
      { label: 'Cattle Detected', value: String(cattle), meta: 'Cattle predictions', tone: 'sky' },
      { label: 'Buffalo Detected', value: String(buffalo), meta: 'Buffalo predictions', tone: 'amber' },
      { label: 'Supported Breeds', value: '6', meta: 'Breed classes', tone: 'slate' },
    ];
  }

  private buildRecent(predictions: PredictionRecord[]): Array<PredictionRecord & { image: string }> {
    if (predictions.length > 0) {
      return predictions.slice(0, 4).map((entry) => ({
        ...entry,
        image: entry.image_path || 'https://images.unsplash.com/photo-1559697249-94a95a2fd6e6?auto=format&fit=crop&w=600&q=80',
      }));
    }

    return [
      {
        id: 1,
        image_path: 'https://images.unsplash.com/photo-1559697249-94a95a2fd6e6?auto=format&fit=crop&w=600&q=80',
        breed: 'Sahiwal',
        category: 'Cattle',
        confidence: 94.6,
        created_at: '2025-01-15T09:30:00Z',
        image: 'https://images.unsplash.com/photo-1559697249-94a95a2fd6e6?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 2,
        image_path: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        breed: 'Murrah',
        category: 'Buffalo',
        confidence: 91.2,
        created_at: '2025-01-14T12:45:00Z',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 3,
        image_path: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
        breed: 'Jersey',
        category: 'Cattle',
        confidence: 88.4,
        created_at: '2025-01-12T08:20:00Z',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      },
    ];
  }
}
