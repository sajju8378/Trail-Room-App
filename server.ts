import express from 'express';
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
import { PROVIDERS } from './server/tryon/providers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High payload limit for camera photo uploads
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// 1. Photo validation endpoint
app.post('/api/validate-photo', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Customer image is required' });
    }
    const result = await validateCustomerPhoto(imageBase64);
    res.json(result);
  } catch (err: any) {
    console.error('Validation route error:', err);
    res.status(500).json({ error: err?.message || 'Failed to validate photo' });
  }
});

// 2. Garment auto-detection endpoint
app.post('/api/detect-garment', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Garment image is required' });
    }
    const result = await detectGarmentDetails(imageBase64);
    res.json(result);
  } catch (err: any) {
    console.error('Garment detection route error:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze garment' });
  }
});

// 3. Submit Try-On Job
app.post('/api/tryon/submit', async (req, res) => {
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
      return res.status(400).json({ error: 'Both customer image and garment image are required' });
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
    res.status(500).json({ error: err?.message || 'Failed to submit try-on job' });
  }
});

// 4. Poll Try-On Job Status
app.get('/api/tryon/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobsStore.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found or has expired' });
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

// 5. Catalogue List
app.get('/api/catalogue', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'all') {
    const filtered = catalogueStore.filter((g) => g.category === category);
    return res.json(filtered);
  }
  res.json(catalogueStore);
});

// 6. Add Catalogue Garment
app.post('/api/catalogue', (req, res) => {
  try {
    const { name, category, price, size, sku, fabric, color, imageUrl, description } = req.body;

    if (!name || !category || !imageUrl) {
      return res.status(400).json({ error: 'Name, category, and image are required' });
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
    res.status(500).json({ error: err?.message || 'Failed to add garment' });
  }
});

// 7. Customer Reserve Item / Ask Staff
app.post('/api/reserve', (req, res) => {
  try {
    const { sessionId, customerName, customerPhone, garmentSku, garmentName, garmentPrice, size } = req.body;

    if (!customerName || !customerPhone || !garmentSku) {
      return res.status(400).json({ error: 'Customer name, phone, and garment SKU are required' });
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
    res.status(500).json({ error: err?.message || 'Failed to place reservation' });
  }
});

// 8. Staff / Admin Metrics
app.get('/api/admin/metrics', (req, res) => {
  const metrics = getAdminMetrics();
  res.json({
    ...metrics,
    recentReservations: reservationsStore.slice(0, 8),
  });
});

// 9. Staff Kiosk Quick Reset
app.post('/api/admin/reset-session', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    quickResetSession(sessionId);
  }
  res.json({ success: true, message: 'Session erased for customer privacy.' });
});

// 10. Showroom Configuration
app.get('/api/showroom-config', (req, res) => {
  res.json(showroomConfig);
});

app.post('/api/showroom-config', (req, res) => {
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

// 11. Available Providers and Architecture Info
app.get('/api/providers', (req, res) => {
  const providersList = Object.values(PROVIDERS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    costPerTryOnUSD: p.costPerTryOnUSD,
    averageLatencySec: p.averageLatencySec,
    isAvailable: p.isAvailable(),
  }));
  res.json({
    activeProvider: showroomConfig.activeProviderId,
    providers: providersList,
  });
});

// Vite middleware in dev or static files in production
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Virtual Try-On Showroom Server running on port ${PORT}`);
  });
}

startServer();
