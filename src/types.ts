export interface CropRecommendation {
  recommendedCrop: string;
  confidence: number;
  alternatives: {
    name: string;
    suitability: number;
  }[];
  reasoning: string;
  featureImportance: {
    N: number;
    P: number;
    K: number;
    Temperature: number;
    Humidity: number;
    pH: number;
    Rainfall: number;
  };
  tips: string[];
}

export interface SoilData {
  n: number;
  p: number;
  k: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  location?: string;
}
