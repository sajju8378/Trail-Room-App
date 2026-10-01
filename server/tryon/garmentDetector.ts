import { GoogleGenAI, Type } from '@google/genai';
import { GarmentCategory, GarmentDetectionResult } from './types.js';

let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  aiInstance = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiInstance;
}

export async function detectGarmentDetails(imageBase64: string): Promise<GarmentDetectionResult> {
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

  const ai = getAi();
  if (!ai) {
    return {
      category: 'saree',
      categoryConfidence: 85,
      detectedName: 'Traditional Attire',
      fabricType: 'Silk blend',
      dominantColors: ['Maroon', 'Gold'],
      hasZariOrEmbroidery: true,
      specialFeatures: ['Woven border', 'Contrast styling'],
    };
  }

  try {
    const prompt = `Analyze this garment image for a luxury Indian & Western fashion showroom.
Identify:
1. Category: Exactly one of: saree, kurta_pajama, salwar_suit, lehenga, sherwani, dress, shirt_trousers.
   - saree: Look for pleated fabric, pallu, blouse fabric, border.
   - lehenga: Look for flared voluminous skirt + choli + dupatta.
   - kurta_pajama: Long tunic / kurta with pajama, dhoti or churidar.
   - sherwani: Royal structured achkan jacket with mandarin collar.
   - salwar_suit: Salwar kameez, anarkali, or straight suit set.
   - dress: Western gown, maxi dress, cocktail dress.
   - shirt_trousers: Formal or casual shirt and trousers/pants.
2. Fabric type (e.g. Silk, Banarasi, Georgette, Velvet, Linen, Cotton).
3. Dominant colors.
4. Embroidery / Zari detection (true if metallic gold/silver thread, zardozi, or sequins present).
5. Special features (e.g. "Peacock border", "Contrast pallu", "Mandarin collar").

Return JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'One of: saree, kurta_pajama, salwar_suit, lehenga, sherwani, dress, shirt_trousers',
            },
            categoryConfidence: { type: Type.INTEGER, description: 'Confidence 0-100' },
            detectedName: { type: Type.STRING, description: 'Descriptive title for this garment' },
            fabricType: { type: Type.STRING, description: 'Guessed fabric material' },
            dominantColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Main colors',
            },
            hasZariOrEmbroidery: { type: Type.BOOLEAN, description: 'Whether metallic or heavy work exists' },
            specialFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific highlights like borders, pleats, cut',
            },
          },
          required: [
            'category',
            'categoryConfidence',
            'detectedName',
            'fabricType',
            'dominantColors',
            'hasZariOrEmbroidery',
            'specialFeatures',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const validCategories: GarmentCategory[] = [
      'saree',
      'kurta_pajama',
      'salwar_suit',
      'lehenga',
      'sherwani',
      'dress',
      'shirt_trousers',
    ];

    let category: GarmentCategory = 'saree';
    if (validCategories.includes(parsed.category as GarmentCategory)) {
      category = parsed.category as GarmentCategory;
    }

    return {
      category,
      categoryConfidence: parsed.categoryConfidence || 90,
      detectedName: parsed.detectedName || 'Showroom Garment',
      fabricType: parsed.fabricType || 'Handloom Silk',
      dominantColors: parsed.dominantColors?.length ? parsed.dominantColors : ['Gold', 'Red'],
      hasZariOrEmbroidery: !!parsed.hasZariOrEmbroidery,
      specialFeatures: parsed.specialFeatures || [],
    };
  } catch (err) {
    console.error('Garment detection error:', err);
    return {
      category: 'saree',
      categoryConfidence: 80,
      detectedName: 'Indian Festive Apparel',
      fabricType: 'Silk Fabric',
      dominantColors: ['Crimson', 'Gold'],
      hasZariOrEmbroidery: true,
      specialFeatures: ['Fine handwoven weave'],
    };
  }
}
