import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Plus, Check } from 'lucide-react';
import { CatalogueGarment, GarmentCategory, Language } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface AddGarmentModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onGarmentAdded: (garment: CatalogueGarment) => void;
}

export const AddGarmentModal: React.FC<AddGarmentModalProps> = ({
  lang,
  isOpen,
  onClose,
  onGarmentAdded,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('saree');
  const [price, setPrice] = useState('12500');
  const [sku, setSku] = useState('SKU-' + Math.floor(100 + Math.random() * 900));
  const [size, setSize] = useState('Free Size');
  const [fabric, setFabric] = useState('Pure Silk Handloom');
  const [color, setColor] = useState('Royal Gold & Maroon');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          sku,
          size,
          fabric,
          color,
          imageUrl,
          description,
        }),
      });
      const data = await res.json();
      onGarmentAdded(data);
      onClose();
    } catch (err) {
      console.error('Failed to add garment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-lg text-amber-100">
              Add New Garment to Showroom
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Garment Image Upload */}
          <div>
            <label className="block font-medium text-stone-300 mb-1">
              Garment Photograph *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-700 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-stone-950/40"
            >
              {imageUrl ? (
                <div className="relative aspect-[4/3] w-full max-h-48 mx-auto rounded-lg overflow-hidden border border-stone-800">
                  <img src={imageUrl} alt="New item" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="py-4 space-y-1">
                  <Camera className="w-6 h-6 text-amber-500 mx-auto" />
                  <p className="text-stone-300 font-medium">Click to upload or snap piece</p>
                  <p className="text-stone-500 text-[10px]">High resolution JPEG/PNG</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Name & SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-300 mb-1">
                Outfit Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zari Tissue Saree"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-300 mb-1">
                Showroom SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="saree">Saree & Pallu</option>
                <option value="lehenga">Bridal Lehenga</option>
                <option value="kurta_pajama">Kurta Pajama</option>
                <option value="sherwani">Royal Sherwani</option>
                <option value="salwar_suit">Salwar Suit</option>
                <option value="dress">Evening Gown</option>
                <option value="shirt_trousers">Shirt & Trousers</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-300 mb-1">
                Showroom Price (₹) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Fabric, Size, Color */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium text-stone-300 mb-1">Fabric</label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-300 mb-1">Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-300 mb-1">Color / Tone</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-stone-300 mb-1">
              Drape & Weave Details
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Zari borders, contrast pallu with handmade tassels..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-100 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || !imageUrl}
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold transition-all shadow-md shadow-amber-950/40"
            >
              {isSubmitting ? 'Saving...' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
