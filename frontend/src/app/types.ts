export interface BreedMetadata {
  name: string;
  display_name: string;
  breed?: string;
  category: string;
  origin: string;
  description: string;
}

export interface PredictionRecord {
  id: number;
  image_path: string;
  breed: string;
  category: string;
  confidence: number;
  created_at: string;
}

export interface PredictionResponse {
  success: boolean;
  breed: string;
  category: string;
  confidence: number;
  display_name?: string;
  origin?: string;
  description?: string;
  image_url?: string;
  prediction_id?: number;
  error?: string;
}

export interface AnalyticsSummary {
  total_predictions: number;
  cattle_predictions: number;
  buffalo_predictions: number;
  average_confidence: number;
  breed_distribution: Array<{ breed: string; count: number }>;
  time_series: Array<{ label: string; count: number }>;
}
