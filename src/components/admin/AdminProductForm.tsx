import React, { useState } from 'react';
import { ArrowLeft, Save, Upload, Image, Check, Trash2, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../services/db';

interface AdminProductFormProps {
  initialProduct?: Product | null;
  onCancel: () => void;
  onSaved: () => void;
}



export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  onCancel,
  onSaved,
}) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || '');
  const [color, setColor] = useState(initialProduct?.color || '');
  const [price, setPrice] = useState<number>(initialProduct?.price || 24000);
  // Default stock must strictly be 10 units as requested
  const [stockQuantity, setStockQuantity] = useState<number>(
    initialProduct?.stockQuantity !== undefined ? initialProduct.stockQuantity : 10
  );
 
  const [accessoriesInput, setAccessoriesInput] = useState(
    initialProduct?.accessories?.join(', ') ||
      'Bandoulière amovible, Pochon de protection satiné, Fermoir bijou doré'
  );
  const [category, setCategory] = useState<'bandouliere' | 'porte-main' | 'cabas' | 'pochette'>(
    initialProduct?.category || 'porte-main'
  );

  // Images state
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.imageUrl || ''
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const accessoriesList = accessoriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditing && initialProduct) {
      db.updateProduct(initialProduct.id, {
        name: name.trim(),
        color: color.trim(),
       
        price: Number(price) || 0,
        stockQuantity: Number(stockQuantity) || 0,
        accessories: accessoriesList,
        imageUrl,
        category,
      });
    } else {
      db.createProduct({
        name: name.trim(),
        color: color.trim(),
        
        price: Number(price) || 0,
        stockQuantity: Number(stockQuantity) || 0,
        accessories: accessoriesList,
        imageUrl,
        category,
      });
    }

    onSaved();
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E0D7]">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 border border-[#E8E0D7] hover:bg-[#F1ECE5] text-[#29231F] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-3xl text-[#29231F] font-normal">
              {isEditing ? `Modifier : ${initialProduct?.name} (${initialProduct?.color})` : 'Ajouter un nouveau sac'}
            </h1>
            <p className="text-xs text-[#8C8178] mt-0.5">
              Rappel : chaque fiche correspond à une couleur unique.
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs uppercase tracking-wider text-[#8C8178] hover:text-[#29231F] cursor-pointer"
        >
          Annuler
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Form Fields */}
          <div className="md:col-span-7 space-y-5 bg-white p-6 border border-[#E8E0D7]">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#765343]">
              Informations générales
            </h3>

            {/* Product name & color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Nom du modèle *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Sac à main"
                  className="w-full px-3 py-2.5 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Couleur du sac *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="ex: Noir, blanc, Rose..."
                    className="flex-1 px-3 py-2.5 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
                  />
                 
                </div>
              </div>
            </div>

            {/* Price & Initial Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="ex: 24000"
                  className="w-full px-3 py-2.5 text-sm font-semibold tabular-nums bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Stock initial disponible * <span className="text-[#765343] text-[10px]">(défaut 10)</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-2.5 text-sm font-bold font-mono tabular-nums bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
                />
                <p className="text-[11px] text-[#8C8178] mt-1">
                  {stockQuantity === 0
                    ? '⚠️ Stock à 0 : affichera automatiquement la bannière rouge « CE SAC EST ÉPUISÉ » et le bouton « Précommander ».'
                    : stockQuantity <= 3
                    ? '⚠️ Stock entre 1 et 3 : affichera le statut « Stock limité ».'
                    : '✓ Stock suffisant : affichera le statut « En stock ».'}
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                Catégorie de sac
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
              >
                <option value="porte-main">Sac à main</option>
                <option value="bandouliere">Sac bandoulière</option>
                <option value="cabas">Grand cabas</option>
              </select>
            </div>

           

            {/* Accessories */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                Accessoires inclus <span className="text-[10px] text-[#8C8178]">(séparés par des virgules)</span>
              </label>
              <input
                type="text"
                value={accessoriesInput}
                onChange={(e) => setAccessoriesInput(e.target.value)}
                placeholder="Bandoulière cuir, Chaîne dorée, Pochon brodé..."
                className="w-full px-3 py-2.5 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column: Photography Management */}
          <div className="md:col-span-5 space-y-5 bg-white p-6 border border-[#E8E0D7]">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#765343]">
              Photographie du sac
            </h3>

            {/* Image Preview Box */}
            <div className="relative aspect-square bg-[#F1ECE5] border border-[#E8E0D7] overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Prévisualisation du sac"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="text-center p-4 text-[#8C8178] text-xs">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>Aucune photo sélectionnée</span>
                </div>
              )}
            </div>

            {/* Image Upload / Input */}
            <div className="space-y-3 pt-2 border-t border-[#E8E0D7]">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Téléverser depuis votre appareil
                </label>
                <label className="w-full py-2.5 px-3 border border-dashed border-[#8C8178] hover:border-[#29231F] bg-[#FAF8F4] text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#765343]" />
                  <span>Choisir une photo locale (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>


             
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E0D7]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs uppercase tracking-wider text-[#8C8178] hover:text-[#29231F] cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-8 py-3 text-xs uppercase tracking-[0.16em] font-medium text-white bg-[#29231F] hover:bg-[#765343] transition-colors flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Mettre à jour le produit' : 'Enregistrer le produit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
