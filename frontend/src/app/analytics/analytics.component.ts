import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { BreedService } from '../breed.service';
import { AnalyticsSummary } from '../types';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  analytics: AnalyticsSummary | null = null;

  public doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '55%',
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
  };

  public doughnutChartType: 'doughnut' = 'doughnut';
  public barChartType: 'bar' = 'bar';
  public lineChartType: 'line' = 'line';

  constructor(private readonly breedService: BreedService) {}

  ngOnInit(): void {
    this.breedService.getAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
        this.updateCharts(analytics);
      },
      error: () => {
        this.analytics = null;
      },
    });
  }

  private updateCharts(analytics: AnalyticsSummary): void {
    const breedLabels = analytics.breed_distribution.map((entry) => entry.breed);
    const breedCounts = analytics.breed_distribution.map((entry) => entry.count);
    const timeLabels = analytics.time_series.map((entry) => entry.label);
    const timeCounts = analytics.time_series.map((entry) => entry.count);

    this.doughnutChartData = {
      labels: ['Cattle', 'Buffalo'],
      datasets: [
        {
          data: [analytics.cattle_predictions, analytics.buffalo_predictions],
          backgroundColor: ['#10b981', '#0f766e'],
        },
      ],
    };

    this.barChartData = {
      labels: breedLabels,
      datasets: [
        {
          label: 'Predictions',
          data: breedCounts,
          backgroundColor: '#34d399',
          borderRadius: 8,
        },
      ],
    };

    this.lineChartData = {
      labels: timeLabels,
      datasets: [
        {
          label: 'Daily predictions',
          data: timeCounts,
          borderColor: '#059669',
          backgroundColor: 'rgba(16,185,129,0.15)',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }
}
