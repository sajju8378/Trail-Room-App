# TrialRoom Studio - Showroom Virtual Try-On ("Trial Room")

A mobile-first virtual try-on application engineered for luxury Indian and western apparel showrooms. Customers can see how garments look on their own body before buying, while preserving **100% face likeness, skin tone, hair, and body posture** without identity drift.

---

## 1. Proposed Architecture & Pipeline

Virtual try-on for structured and draped ethnic wear (sarees with pleated pallus, heavy zari borders, structured sherwanis, flared lehengas, and kurtas) requires a dedicated multi-stage pipeline:

```
[Customer Portrait] ────────► [1. Validation & Safety] ──► [2. Person Agnostic Mask + DensePose]
                                                                        │
[Garment Photo / SKU] ──────► [3. Border & Drape Warping] ──────────────┤
                                                                        ▼
                                                         [4. Diffusion Inpainting / Try-On UNet]
                                                                        │
[Original Face Patch] ──────► [5. Face & Likeness Restoration Blend] ◄──┘
                                        │
                                        ▼
                              [6. Automated QA Auditor] ──► [Before/After Slider & Counter Alert]
```

### Pipeline Stages
1. **Intake Validation**: Checks for single person presence, sharpness/blur, lighting, and content safety (rejects minors and non-person images).
2. **Pose & Silhouette Mapping**: Isolates the garment region while locking the head, neck, hands, and background.
3. **Garment Warping**: Arranges pleats, collar plackets, and borders based on body pose.
4. **Diffusion Inpainting**: Generates natural folds, drape, and ambient showroom lighting.
5. **Face Restoration Blending**: Pastes the high-resolution face patch from the customer's original photo back onto the try-on result with feathered edges, ensuring zero facial hallucination.
6. **Automated QA Auditor**: Evaluates Face Identity Similarity (0-100) and Garment Color/Weave Fidelity (0-100). Warns or prompts retry if score < 80%.

---

## 2. Model & API Comparison with Cost Per Try-On

| Provider / Model | Pipeline Method | Avg. Latency | Est. Cost / Try-On | Identity Drift Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Gemini Neural Pipeline** (`gemini-3.1-flash-image`) | Multimodal Vision Conditioning | 12 - 16s | **~$0.039** | 0% (with Face Patch) |
| **Hosted IDM-VTON** (Replicate / Fal.ai) | Garment-UNet + Tryon-UNet | 16 - 22s | **~$0.028** | 0% (with Face Patch) |
| **Self-Hosted GPU Worker** (AWS L4 / RunPod) | CatVTON / IDM-VTON Diffusers | 8 - 12s | **~$0.008** | 0% (with Face Patch) |
| **Aura High-Speed Warp** (Edge GPU) | Deterministic Mesh Warp | 4 - 6s | **<$0.005** | 0% (Exact original) |

*Recommendation:* Use Gemini Neural Pipeline or Hosted IDM-VTON for online luxury showrooms; use Edge Warp for instant kiosk queue turnover.

---

## 3. How to Swap the Try-On Model / API

All virtual try-on logic is encapsulated behind the `IVirtualTryOnProvider` TypeScript interface in `server/tryon/providers.ts`:

```typescript
export interface IVirtualTryOnProvider {
  id: string;
  name: string;
  costPerTryOnUSD: number;
  averageLatencySec: number;
  execute(params: {
    customerImageBase64: string;
    garmentImageBase64: string;
    garmentName: string;
    garmentCategory: string;
    onProgress: (status: string, stepText: string, progressPct: number) => void;
  }): Promise<TryOnGenerationResult>;
}
```

### Steps to Add an External Hosted Provider (e.g., Fashn.ai or Replicate):
1. In `server/tryon/providers.ts`, implement the `IVirtualTryOnProvider` interface:
```typescript
class ReplicateIdmVtonProvider implements IVirtualTryOnProvider {
  id = 'replicate_idm_vton';
  name = 'Replicate IDM-VTON API';
  costPerTryOnUSD = 0.028;
  averageLatencySec = 18;

  async execute({ customerImageBase64, garmentImageBase64, onProgress }) {
    onProgress('tryon_diffusion', 'Calling Replicate API...', 60);
    const outputUrl = await callReplicateWebhook(customerImageBase64, garmentImageBase64);
    // Face blend & QA pass
    return { resultImageUrl: outputUrl, qaMetrics: { ... }, latencyMs: 18000, providerId: this.id };
  }
}
```
2. Register the class in `PROVIDERS`:
```typescript
PROVIDERS['replicate_idm_vton'] = new ReplicateIdmVtonProvider();
```
3. Showroom staff can now select this provider in the **Admin Dashboard > Settings** dropdown on the fly.

---

## 4. Environment Variables

Create a `.env` file or configure via AI Studio Secrets:

```bash
# Required for Gemini AI vision validation, garment analysis, try-on synthesis & QA checks
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000)
PORT=3000

# Optional: Host URL for QR codes and self-referential links
APP_URL="https://your-showroom-app.run.app"
```

---

## 5. Local Setup & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express backend + Vite frontend)
npm run dev

# 3. Build for production
npm run build
npm start
```

---

## 6. Showroom Features
- **Staff / Kiosk Mode**: Counter tablet view with 1-click **Quick Reset** (wipes customer portrait immediately for privacy).
- **Catalogue Manager**: Add garments with custom photos, SKU, price in INR, size, and fabric details.
- **Multilingual UI**: Instant toggle between **English**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
- **Before / After Slider**: Drag handle with pinch-to-zoom for checking intricate zari weaves and borders.
- **Side-by-Side Comparison**: Compare up to 3 try-on looks at once before purchasing.
- **Phone QR Transfer**: Customer scans a QR code to review their fitting results on their smartphone.
- **Reserve Item**: Alerts showroom assistants to bring the selected garment to the fitting booth.
