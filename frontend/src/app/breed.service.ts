import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../environments/environment';
import {
  AnalyticsSummary,
  BreedMetadata,
  PredictionRecord,
  PredictionResponse,
} from './types';

@Injectable({ providedIn: 'root' })
export class BreedService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  predictImage(file: File): Observable<PredictionResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http
      .post<PredictionResponse>(`${this.apiUrl}/api/predict`, formData)
      .pipe(catchError(this.handleError));
  }

  getPredictions(): Observable<PredictionRecord[]> {
    return this.http
      .get<{ success: boolean; predictions: PredictionRecord[] }>(`${this.apiUrl}/api/predictions`)
      .pipe(
        map((response) => response.predictions ?? []),
        catchError(this.handleError),
      );
  }

  getPrediction(id: number): Observable<PredictionRecord> {
    return this.http
      .get<{ success: boolean; prediction: PredictionRecord }>(`${this.apiUrl}/api/predictions/${id}`)
      .pipe(
        map((response) => response.prediction),
        catchError(this.handleError),
      );
  }

  deletePrediction(id: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/api/predictions/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAnalytics(): Observable<AnalyticsSummary> {
    return this.http
      .get<{ success: boolean; analytics: AnalyticsSummary }>(`${this.apiUrl}/api/analytics`)
      .pipe(
        map((response) => response.analytics),
        catchError(this.handleError),
      );
  }

  getBreeds(): Observable<BreedMetadata[]> {
    return this.http
      .get<{ success: boolean; breeds: BreedMetadata[] }>(`${this.apiUrl}/api/breeds`)
      .pipe(
        map((response) => response.breeds ?? []),
        catchError(this.handleError),
      );
  }

  getBreed(name: string): Observable<BreedMetadata> {
    return this.http
      .get<{ success: boolean; breed: BreedMetadata }>(`${this.apiUrl}/api/breeds/${encodeURIComponent(name)}`)
      .pipe(
        map((response) => response.breed),
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.error || error.message || 'The backend request failed.';
    return throwError(() => new Error(message));
  }
}
