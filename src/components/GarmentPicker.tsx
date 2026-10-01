import React, { useState, useRef } from 'react';
import { Sparkles, Plus, Upload, Camera, Check, Tag, Info, Layers } from 'lucide-react';
import { CatalogueGarment, GarmentCategory, Language } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface GarmentPickerProps {
  lang: Language;
  catalogue: CatalogueGarment[];
  selectedGarment: {
    imageUrl: string;
    name: string;
    category: GarmentCategory;
    sku?: string;
    price?: number;
    fabric?: string;
  } | null;
  onSelectGarment: (garment: {
    imageUrl: string;
    name: string;
    category: GarmentCategory;
    sku?: string;
    price?: number;
    fabric?: string;
  }) => void;
  onOpenAddGarment: () => void;
  onProceedToTrial: () => void;
}

const CATEGORIES: { id: GarmentCategory | 'all'; labelKey: keyof typeof TRANSLATIONS['en'] }[] = [
  { id: 'all', labelKey: 'allCategories' },
  { id: 'saree', labelKey: 'cat_saree' },
  { id: 'lehenga', labelKey: 'cat_lehenga' },
  { id: 'kurta_pajama', labelKey: 'cat_kurta_pajama' },
  { id: 'sherwani', labelKey: 'cat_sherwani' },
  { id: 'salwar_suit', labelKey: 'cat_salwar_suit' },
  { id: 'dress', labelKey: 'cat_dress' },
  { id: 'shirt_trousers', labelKey: 'cat_shirt_trousers' },
];

export const GarmentPicker: React.FC<GarmentPickerProps> = ({
  lang,
  catalogue,
  selectedGarment,
  onSelectGarment,
  onOpenAddGarment,
  onProceedToTrial,
}) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'catalogue' | 'custom'>('catalogue');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<GarmentCategory | 'all'>('all');

  // Custom upload state
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string>('Bespoke Garment');
  const [customCategory, setCustomCategory] = useState<GarmentCategory>('saree');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionNotes, setDetectionNotes] = useState<string | null>(null);

  const filteredCatalogue =
    selectedCategoryFilter === 'all'
      ? catalogue
      : catalogue.filter((g) => g.category === selectedCategoryFilter);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);
      autoDetectGarment(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const autoDetectGarment = async (imageBase64: string) => {
    setIsDetecting(true);
    setDetectionNotes(null);

    try {
      const res = await fetch('/api/detect-garment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await res.json();
      if (data.category) {
        setCustomCategory(data.category);
        setCustomName(data.detectedName || 'Custom Outfit');
        setDetectionNotes(
          `${data.fabricType || 'Handloom'} · ${data.specialFeatures?.join(', ') || 'Fine drape'}`
        );

        onSelectGarment({
          imageUrl: imageBase64,
          name: data.detectedName || 'Custom Outfit',
          category: data.category,
          fabric: data.fabricType,
        });
      }
    } catch (err) {
      console.error('Detection error:', err);
      onSelectGarment({
        imageUrl: imageBase64,
        name: customName,
        category: customCategory,
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-serif font-bold text-xl text-amber-100">
            {t.step2Title}
          </h2>
          <p className="text-xs text-stone-400">
            {t.step2Subtitle}
          </p>
        </div>

        {/* Tab switch between Catalogue and Custom Snap */}
        <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('catalogue')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'catalogue'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {t.showroomCatalogue}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadGarment}</span>
          </button>
        </div>
      </div>

      {activeTab === 'catalogue' ? (
        <>
          {/* Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors border ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-amber-950/80 border-amber-600 text-amber-200 font-semibold'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {t[cat.labelKey]}
              </button>
            ))}

            {/* Add to Catalogue button */}
            <button
              type="button"
              onClick={onOpenAddGarment}
              className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap bg-stone-900 hover:bg-stone-800 border border-dashed border-stone-700 text-stone-300 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addGarmentBtn}</span>
            </button>
          </div>

          {/* Garments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalogue.map((garment) => {
              const isSelected = selectedGarment?.sku === garment.sku;
              return (
                <div
                  key={garment.id}
                  onClick={() =>
                    onSelectGarment({
                      imageUrl: garment.imageUrl,
                      name: garment.name,
                      category: garment.category,
                      sku: garment.sku,
                      price: garment.price,
                      fabric: garment.fabric,
                    })
                  }
                  className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500'
                      : 'bg-stone-900/70 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900'
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                    <img
                      src={garment.imageUrl}
                      alt={garment.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                    {/* Top badging */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-stone-300 bg-stone-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-stone-800">
                        {garment.sku}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-medium capitalize">
                          {garment.category.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-amber-200 tabular-nums">
                          ₹{garment.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-100 line-clamp-1">
                        {garment.name}
                      </h4>
                    </div>
                  </div>

                  {/* Card Details Body */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-1 text-stone-400">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>{t.fabric}: {garment.fabric}</span>
                        <span>{t.size}: {garment.size}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                        {garment.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGarment({
                          imageUrl: garment.imageUrl,
                          name: garment.name,
                          category: garment.category,
                          sku: garment.sku,
                          price: garment.price,
                          fabric: garment.fabric,
                        });
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      }`}
                    >
                      {isSelected ? t.tryOnThis : 'Select this Piece'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Custom Garment Snap / Upload Mode */
        <div className="max-w-md mx-auto space-y-4 p-5 bg-stone-900/80 border border-stone-800 rounded-2xl">
          <div className="text-center space-y-1">
            <h3 className="font-serif font-bold text-base text-amber-100">
              {t.uploadGarment}
            </h3>
            <p className="text-xs text-stone-400">
              Take a photo of any outfit in the showroom or upload an image
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-700 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-3 bg-stone-950/40"
          >
            {customImage ? (
              <div className="relative aspect-[3/4] w-full max-h-72 mx-auto rounded-xl overflow-hidden border border-stone-800">
                <img
                  src={customImage}
                  alt="Custom garment"
                  className="w-full h-full object-cover"
                />
                {isDetecting && (
                  <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-4">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-bounce" />
                    <span className="text-xs text-amber-200">
                      {t.detectingGarment}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 py-6">
                <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-amber-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-stone-200">
                    Click to capture or upload garment image
                  </p>
                  <p className="text-[11px] text-stone-400">
                    PNG, JPG, WEBP up to 25MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
          </div>

          {/* Garment parameters */}
          {customImage && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Outfit Name / Tag
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-stone-300">
                    Attire Category
                  </label>
                  <button
                    type="button"
                    onClick={() => customImage && autoDetectGarment(customImage)}
                    disabled={isDetecting}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t.autoDetectGarment}</span>
                  </button>
                </div>
                <select
                  value={customCategory}
                  onChange={(e) => {
                    const cat = e.target.value as GarmentCategory;
                    setCustomCategory(cat);
                    onSelectGarment({
                      imageUrl: customImage,
                      name: customName,
                      category: cat,
                    });
                  }}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="saree">Saree (with Blouse & Pallu)</option>
                  <option value="lehenga">Bridal Lehenga</option>
                  <option value="kurta_pajama">Kurta + Pajama/Churidar</option>
                  <option value="sherwani">Royal Sherwani</option>
                  <option value="salwar_suit">Salwar Suit / Anarkali</option>
                  <option value="dress">Evening Gown / Dress</option>
                  <option value="shirt_trousers">Shirt & Trousers</option>
                </select>
              </div>

              {detectionNotes && (
                <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>Detected features: {detectionNotes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating or fixed CTA button when a garment is selected */}
      {selectedGarment && (
        <div className="sticky bottom-4 z-20 max-w-lg mx-auto p-3 bg-stone-950/95 backdrop-blur-md border border-amber-700/80 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={selectedGarment.imageUrl}
              alt={selectedGarment.name}
              className="w-10 h-10 rounded-lg object-cover border border-amber-800 shrink-0"
            />
            <div className="truncate">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold block leading-tight">
                Ready for Trial
              </span>
              <p className="text-xs font-serif font-bold text-stone-100 truncate">
                {selectedGarment.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToTrial}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-950/60 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            {t.startFitting}
          </button>
        </div>
      )}
    </div>
  );
};
