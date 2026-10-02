import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateCustomerPhoto } from './server/tryon/validation.js';
import { detectGarmentDetails } from './server/tryon/garmentDetector.js';
import {
  catalogueStore,
  enqueueTryOnJob,
  getAdminMetrics,
  jobsStore,
  quickResetSession,
  reservationsStore,
  showroomConfig,
  updateShowroomConfig,
} from './server/tryon/jobQueue.js';
import { getTryOnProvider, PROVIDERS } from './server/tryon/providers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable Cross-Origin Resource Sharing (CORS) for Android APK & external clients
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// High payload limit for camera photo uploads (up to 35MB base64)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// In-Memory Rate Limiter for Try-On Endpoints (10 requests per minute per IP)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();

function tryOnRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  let record = ipRateLimits.get(clientIp);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    ipRateLimits.set(clientIp, record);
    return next();
  }

  if (record.count >= maxRequests) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    return res.status(429).json({
      error: `Rate limit exceeded. Maximum ${maxRequests} try-on requests per minute. Please retry after ${retryAfterSec} seconds.`,
      code: 'RATE_LIMITED',
      retryAfterSec,
    });
  }

  record.count += 1;
  next();
}

// Clean up expired rate limit keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    if (now > record.resetTime) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ==========================================
// 1. Health & Status Check Endpoint
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const provider = (process.env.TRYON_PROVIDER || 'gemini').toLowerCase().trim();

  res.json({
    status: 'ok',
    service: 'TrialRoom Studio Virtual Try-On API',
    provider,
    hasApiKey,
    uptimeSec: Math.round(process.uptime()),
    timestamp: Date.now(),
  });
});

// ==========================================
// 2. Synchronous Virtual Try-On API (POST /api/tryon)
// Accepts: person image, garment image, garment category
// Returns: generated base64 image or detailed JSON error (never silently returns original)
// ==========================================
app.post('/api/tryon', tryOnRateLimiter, async (req: Request, res: Response) => {
  let personImage: string | undefined = req.body.personImage || req.body.person || req.body.customerImage;
  let garmentImage: string | undefined = req.body.garmentImage || req.body.garment;
  const garmentCategory: string = req.body.garmentCategory || req.body.category || 'saree';
  const garmentName: string = req.body.garmentName || 'Showroom Garment';

  try {
    // A. Required fields validation
    if (!personImage || typeof personImage !== 'string') {
      return res.status(400).json({
        error: 'Missing required field: personImage (base64 string or data URL).',
        code: 'MISSING_PERSON_IMAGE',
      });
    }

    if (!garmentImage || typeof garmentImage !== 'string') {
      return res.status(400).json({
        error: 'Missing required field: garmentImage (base64 string or data URL).',
        code: 'MISSING_GARMENT_IMAGE',
      });
    }

    // B. Payload size validation (Max 15MB each)
    const MAX_BYTES = 15 * 1024 * 1024;
    const approxPersonBytes = Math.round(personImage.length * 0.75);
    const approxGarmentBytes = Math.round(garmentImage.length * 0.75);

    if (approxPersonBytes > MAX_BYTES) {
      return res.status(400).json({
        error: `Person image size (${Math.round(approxPersonBytes / (1024 * 1024))}MB) exceeds maximum limit of 15MB.`,
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    if (approxGarmentBytes > MAX_BYTES) {
      return res.status(400).json({
        error: `Garment image size (${Math.round(approxGarmentBytes / (1024 * 1024))}MB) exceeds maximum limit of 15MB.`,
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    // C. Image format validation
    const isPersonValidFormat = personImage.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(personImage.substring(0, 50));
    const isGarmentValidFormat = garmentImage.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(garmentImage.substring(0, 50));

    if (!isPersonValidFormat || !isGarmentValidFormat) {
      return res.status(400).json({
        error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP base64 encoded strings or data URLs.',
        code: 'INVALID_IMAGE_FORMAT',
      });
    }

    // D. Validate customer photo (Ensure exactly 1 person visible)
    try {
      const validation = await validateCustomerPhoto(personImage);
      if (validation.personCount !== 1) {
        return res.status(400).json({
          error: validation.personCount === 0
            ? 'No person detected in the photo. Please take a clear standing portrait.'
            : `Multiple people (${validation.personCount}) detected in photo. Virtual try-on requires exactly 1 person.`,
          code: 'INVALID_PERSON_COUNT',
          validation,
        });
      }

      if (validation.safetyPassed === false) {
        return res.status(400).json({
          error: 'Showroom safety notice: Photo did not pass adult showroom safety standards.',
          code: 'SAFETY_CHECK_FAILED',
          validation,
        });
      }
    } catch (valErr) {
      console.warn('Pre-validation check non-fatal error, continuing to provider:', valErr);
    }

    // E. Execute Generative Try-On via configured Provider (Gemini / Replicate / Fal)
    const provider = getTryOnProvider();
    const result = await provider.generateTryOn({
      personImageBase64: personImage,
      garmentImageBase64: garmentImage,
      garmentCategory,
      garmentName,
    });

    if (!result.resultImageBase64 || result.resultImageBase64 === personImage) {
      return res.status(500).json({
        error: 'Try-on provider returned an invalid or unedited image result.',
        code: 'GENERATION_FAILED',
        provider: result.provider,
      });
    }

    return res.status(200).json({
      success: true,
      resultImageUrl: result.resultImageBase64,
      garmentCategory,
      garmentName,
      provider: result.provider,
      latencyMs: result.latencyMs,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('API /api/tryon failed:', err);
    const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(statusCode).json({
      error: err.message || 'An unexpected error occurred during virtual try-on processing.',
      code: err.code || 'TRYON_ERROR',
      provider: process.env.TRYON_PROVIDER || 'gemini',
    });
  } finally {
    // Automatic cleanup of memory: dereference high-memory base64 strings immediately
    personImage = undefined;
    garmentImage = undefined;
  }
});

// ==========================================
// 3. Photo Validation Endpoint (POST /api/validate-photo)
// ==========================================
app.post('/api/validate-photo', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Customer image is required', code: 'MISSING_IMAGE' });
    }
    const result = await validateCustomerPhoto(imageBase64);
    res.json(result);
  } catch (err: any) {
    console.error('Validation route error:', err);
    res.status(500).json({ error: err?.message || 'Failed to validate photo', code: 'VALIDATION_FAILED' });
  }
});

// ==========================================
// 4. Garment Auto-Detection Endpoint (POST /api/detect-garment)
// ==========================================
app.post('/api/detect-garment', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Garment image is required', code: 'MISSING_IMAGE' });
    }
    const result = await detectGarmentDetails(imageBase64);
    res.json(result);
  } catch (err: any) {
    console.error('Garment detection route error:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze garment', code: 'DETECTION_FAILED' });
  }
});

// ==========================================
// 5. Asynchronous Background Try-On Queue (POST /api/tryon/submit & GET /api/tryon/status/:jobId)
// ==========================================
app.post('/api/tryon/submit', tryOnRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      sessionId = 'sess_' + Date.now(),
      customerImage,
      garmentImage,
      garmentName = 'Showroom Selection',
      garmentCategory = 'saree',
      garmentSku,
      garmentPrice,
      providerId,
    } = req.body;

    if (!customerImage || !garmentImage) {
      return res.status(400).json({ error: 'Both customer image and garment image are required', code: 'MISSING_IMAGES' });
    }

    const job = enqueueTryOnJob({
      sessionId,
      customerImage,
      garmentImage,
      garmentName,
      garmentCategory,
      garmentSku,
      garmentPrice,
      providerId,
    });

    res.json({
      jobId: job.id,
      sessionId: job.sessionId,
      status: job.status,
      currentStepText: job.currentStepText,
      progress: job.progress,
      expiresAt: job.expiresAt,
    });
  } catch (err: any) {
    console.error('Submit tryon error:', err);
    res.status(500).json({ error: err?.message || 'Failed to submit try-on job', code: 'SUBMIT_FAILED' });
  }
});

app.get('/api/tryon/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobsStore.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found or has expired', code: 'JOB_NOT_FOUND' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    currentStepText: job.currentStepText,
    resultImageUrl: job.resultImageUrl,
    customerImage: job.customerImage,
    garmentImage: job.garmentImage,
    garmentName: job.garmentName,
    garmentCategory: job.garmentCategory,
    garmentSku: job.garmentSku,
    garmentPrice: job.garmentPrice,
    qaMetrics: job.qaMetrics,
    providerUsed: job.providerUsed,
    latencyMs: job.latencyMs,
    error: job.error,
  });
});

// ==========================================
// 6. Catalogue List & Management
// ==========================================
app.get('/api/catalogue', (req: Request, res: Response) => {
  const { category } = req.query;
  if (category && category !== 'all') {
    const filtered = catalogueStore.filter((g) => g.category === category);
    return res.json(filtered);
  }
  res.json(catalogueStore);
});

app.post('/api/catalogue', (req: Request, res: Response) => {
  try {
    const { name, category, price, size, sku, fabric, color, imageUrl, description } = req.body;

    if (!name || !category || !imageUrl) {
      return res.status(400).json({ error: 'Name, category, and image are required', code: 'MISSING_FIELDS' });
    }

    const newGarment = {
      id: 'garment-' + Date.now(),
      sku: sku || 'SKU-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name,
      category,
      price: Number(price) || 4999,
      size: size || 'Free Size',
      fabric: fabric || 'Pure Silk',
      color: color || 'Multi-color',
      imageUrl,
      description: description || 'Exclusive showroom collection piece.',
      tryOnCount: 0,
      featured: false,
    };

    catalogueStore.unshift(newGarment);
    res.status(201).json(newGarment);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to add garment', code: 'CATALOGUE_ERROR' });
  }
});

// ==========================================
// 7. Customer Reserve Item / Staff Notification
// ==========================================
app.post('/api/reserve', (req: Request, res: Response) => {
  try {
    const { sessionId, customerName, customerPhone, garmentSku, garmentName, garmentPrice, size } = req.body;

    if (!customerName || !customerPhone || !garmentSku) {
      return res.status(400).json({ error: 'Customer name, phone, and garment SKU are required', code: 'MISSING_FIELDS' });
    }

    const reservation = {
      id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
      sessionId: sessionId || 'sess_' + Date.now(),
      customerName,
      customerPhone,
      garmentSku,
      garmentName: garmentName || 'Showroom Piece',
      garmentPrice: Number(garmentPrice) || 0,
      size: size || 'Standard',
      createdAt: Date.now(),
      status: 'pending' as const,
    };

    reservationsStore.unshift(reservation);
    res.status(201).json({
      success: true,
      reservationId: reservation.id,
      message: 'Reservation confirmed! Showroom staff has been alerted to fetch this item for trial.',
      reservation,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to place reservation', code: 'RESERVATION_ERROR' });
  }
});

// ==========================================
// 8. Staff / Admin Metrics & Session Reset
// ==========================================
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const metrics = getAdminMetrics();
  res.json({
    ...metrics,
    recentReservations: reservationsStore.slice(0, 8),
  });
});

app.post('/api/admin/reset-session', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (sessionId) {
    quickResetSession(sessionId);
  }
  res.json({ success: true, message: 'Session erased for customer privacy.' });
});

// ==========================================
// 9. Showroom Configuration
// ==========================================
app.get('/api/showroom-config', (_req: Request, res: Response) => {
  res.json(showroomConfig);
});

app.post('/api/showroom-config', (req: Request, res: Response) => {
  const { name, tagline, address, phone, brandColor, kioskPin, activeProviderId, autoDeleteHours } = req.body;
  updateShowroomConfig({
    ...(name && { name }),
    ...(tagline && { tagline }),
    ...(address && { address }),
    ...(phone && { phone }),
    ...(brandColor && { brandColor }),
    ...(kioskPin && { kioskPin }),
    ...(activeProviderId && { activeProviderId }),
    ...(autoDeleteHours && { autoDeleteHours: Number(autoDeleteHours) }),
  });
  res.json(showroomConfig);
});

app.get('/api/providers', (_req: Request, res: Response) => {
  res.json({
    activeProvider: process.env.TRYON_PROVIDER || 'gemini',
    availableProviders: ['gemini', 'replicate', 'fal_ai'],
  });
});

// ==========================================
// Vite middleware in dev or static files in production
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Virtual Try-On Showroom Server running on port ${PORT}`);
  });
}

startServer();
