export type GarmentCategory =
  | 'saree'
  | 'kurta_pajama'
  | 'salwar_suit'
  | 'lehenga'
  | 'sherwani'
  | 'dress'
  | 'shirt_trousers';

export interface GarmentCategoryOption {
  id: GarmentCategory;
  nameEn: string;
  nameHi: string;
  nameTe: string;
  icon: string;
  drapingTips: string;
}

export interface CatalogueGarment {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  category: GarmentCategory;
  price: number;
  size: string; // e.g. "Free Size", "M", "L", "XL", "Unstitched / Free"
  sku: string;
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
  blurScore: number; // 0 - 100
  resolutionOk: boolean;
  width?: number;
  height?: number;
  safetyPassed: boolean;
  issues: string[];
  feedbackKey: 'ok' | 'no_person' | 'multiple_people' | 'blurry' | 'bad_lighting' | 'low_resolution' | 'minor_detected';
  feedbackText: string;
}

export interface GarmentDetectionResult {
  category: GarmentCategory;
  categoryConfidence: number;
  detectedName: string;
  fabricType: string;
  dominantColors: string[];
  hasZariOrEmbroidery: boolean;
  specialFeatures: string[]; // e.g. ["Heavy zari border", "Contrast pallu", "Embroidered neckline"]
}

export type TryOnJobStatus =
  | 'queued'
  | 'segmenting'
  | 'pose_estimation'
  | 'garment_warping'
  | 'tryon_diffusion'
  | 'face_restoration'
  | 'qa_check'
  | 'completed'
  | 'failed';

export interface QAMetrics {
  faceSimilarity: number; // 0 - 100
  garmentFidelity: number; // 0 - 100
  overallScore: number; // 0 - 100
  passed: boolean;
  notes: string;
}

export interface TryOnJob {
  id: string;
  sessionId: string;
  status: TryOnJobStatus;
  progress: number; // 0 - 100
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

export interface ReservationRequest {
  id?: string;
  sessionId: string;
  customerName: string;
  customerPhone: string;
  garmentSku: string;
  garmentName: string;
  garmentPrice: number;
  size: string;
  tryOnImageUrl?: string;
  notes?: string;
  createdAt?: number;
}

export interface ShowroomConfig {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  brandColor: string; // Hex e.g. #b45309 (amber-700)
  currencySymbol: string;
  kioskPin: string;
  activeProviderId: string;
  autoDeleteHours: number;
}

export interface AdminMetrics {
  totalTrialsToday: number;
  totalReservationsToday: number;
  avgGenerationTimeSec: number;
  qaPassRatePct: number;
  topGarments: {
    sku: string;
    name: string;
    category: string;
    trials: number;
    reservations: number;
  }[];
  hourlyTrials: { hour: string; count: number }[];
  providerStats: {
    provider: string;
    successRate: number;
    avgLatencySec: number;
    costPerRunUSD: number;
  }[];
}
