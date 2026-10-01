export type Language = 'en' | 'hi' | 'te';

export type GarmentCategory =
  | 'saree'
  | 'kurta_pajama'
  | 'salwar_suit'
  | 'lehenga'
  | 'sherwani'
  | 'dress'
  | 'shirt_trousers';

export interface CatalogueGarment {
  id: string;
  sku: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  category: GarmentCategory;
  price: number;
  size: string;
  fabric: string;
  color: string;
  imageUrl: string;
  description: string;
  tryOnCount: number;
  featured?: boolean;
}

export interface PhotoValidationResult {
  isValid: boolean;
  personCount: number;
  isBlurry: boolean;
  blurScore: number;
  resolutionOk: boolean;
  safetyPassed: boolean;
  issues: string[];
  feedbackKey: 'ok' | 'no_person' | 'multiple_people' | 'blurry' | 'bad_lighting' | 'low_resolution' | 'minor_detected';
  feedbackText: string;
}

export interface QAMetrics {
  faceSimilarity: number;
  garmentFidelity: number;
  overallScore: number;
  passed: boolean;
  notes: string;
}

export interface TryOnJob {
  id: string;
  sessionId: string;
  status: 'queued' | 'segmenting' | 'pose_estimation' | 'garment_warping' | 'tryon_diffusion' | 'face_restoration' | 'qa_check' | 'completed' | 'failed';
  progress: number;
  currentStepText: string;
  customerImage: string;
  garmentImage: string;
  garmentName: string;
  garmentCategory: GarmentCategory;
  garmentSku?: string;
  garmentPrice?: number;
  resultImageUrl?: string;
  qaMetrics?: QAMetrics;
  providerUsed: string;
  latencyMs?: number;
  error?: string;
  createdAt: number;
  expiresAt: number;
}

export interface ShowroomConfig {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  brandColor: string;
  currencySymbol: string;
  kioskPin: string;
  activeProviderId: string;
  autoDeleteHours: number;
}
