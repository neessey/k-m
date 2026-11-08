import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Copy,
  AlertOctagon,
  Plus,
  Minus,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Product, getProductAvailability } from '../../types';
import { formatPrice } from '../../config/seller';
import { db } from '../../services/db';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onAddProduct,
  onEditProduct,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [duplicateModal, setDuplicateModal] = useState<Product | null>(null);
  const [duplicateColorName, setDuplicateColorName] = useState('');
  // In-app deletion modal state (replaces window.confirm which is blocked in iframes)
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Filter products
  const filtered = products.filter((p) => {
    const term = search.toLowerCase().trim();
    const matchTerm =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.color.toLowerCase().includes(term);

    if (!matchTerm) return false;

    if (filter === 'in_stock') return p.stockQuantity > 3;
    if (filter === 'low_stock') return p.stockQuantity >= 1 && p.stockQuantity <= 3;
    if (filter === 'out_of_stock') return p.stockQuantity === 0;

    return true;
  });

  const handleConfirmDelete = () => {
    if (deleteConfirmProduct) {
      db.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
    }
  };

  const handleQuickStockChange = (id: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    db.updateStock(id, next);
  };

  const handleDuplicateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateModal) return;
    db.duplicateProduct(duplicateModal.id, duplicateColorName);
    setDuplicateModal(null);
    setDuplicateColorName('');
  };

  const handleKeepOnlyOne = () => {
    db.resetToDefaults();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D7]">
        <div>
          <h1 className="font-serif text-3xl text-[#29231F] font-normal">
            Mes produits ({products.length})
          </h1>
          <p className="text-xs text-[#8C8178] mt-1">
            Chaque couleur est un sac indépendant avec son stock dans Firebase.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {products.length > 1 && (
            <button
              onClick={handleKeepOnlyOne}
              className="px-3 py-2 text-xs font-medium text-[#765343] hover:text-[#29231F] border border-[#E8E0D7] hover:border-[#765343] bg-white transition-colors cursor-pointer flex items-center gap-1.5"
              title="Supprimer tous les sacs et n'en garder qu'un seul"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Garder 1 seul sac</span>
            </button>
          )}

          <button
            onClick={onAddProduct}
            className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-white bg-[#29231F] hover:bg-[#765343] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajouter un sac</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou couleur..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#8C8178] absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="grid w-full grid-cols-2 gap-1 bg-sand p-1 border border-border-subtle text-xs self-start sm:grid-cols-4 md:w-auto md:flex md:flex-wrap md:self-auto">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'in_stock', label: 'En stock (>3)' },
            { id: 'low_stock', label: 'Stock faible (1-3)' },
            { id: 'out_of_stock', label: 'Épuisés (0)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`min-h-8 px-2 py-1 text-center leading-tight font-medium transition-colors cursor-pointer sm:px-3 md:whitespace-nowrap ${
                filter === f.id
                  ? 'bg-white text-charcoal shadow-2xs'
                  : 'text-taupe hover:text-charcoal'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white border border-[#E8E0D7] overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F1ECE5]/70 border-b border-[#E8E0D7] uppercase tracking-wider text-[11px] text-[#8C8178]">
            <tr>
              <th className="py-3 px-4">Sac & Visuel</th>
              <th className="py-3 px-4">Couleur</th>
              <th className="py-3 px-4">Prix</th>
              <th className="py-3 px-4">Stock disponible</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D7]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8C8178]">
                  Aucun sac dans cette liste. Cliquez sur « Ajouter un sac » pour en créer un.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const avail = getProductAvailability(prod.stockQuantity);
                return (
                  <tr key={prod.id} className="hover:bg-[#FAF8F4]/80 transition-colors">
                    {/* Visual & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 object-cover border border-[#E8E0D7] bg-[#F1ECE5] shrink-0"
                        />
                        
                      </div>
                    </td>

                    {/* Color */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                    
                        <span className="font-medium text-[#29231F]">{prod.color}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-semibold text-[#29231F] tabular-nums">
                      {formatPrice(prod.price)}
                    </td>

                    {/* Quick Stock Controls */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickStockChange(prod.id, prod.stockQuantity, -1)}
                          disabled={prod.stockQuantity <= 0}
                          className="p-1 border border-[#E8E0D7] hover:bg-[#F1ECE5] disabled:opacity-40 transition-colors cursor-pointer"
                          title="Diminuer stock"
                        >
                          <Minus className="w-3 h-3 text-[#29231F]" />
                        </button>
                        <span
                          className={`font-mono text-sm font-bold px-2 py-0.5 border ${
                            prod.stockQuantity === 0
                              ? 'text-red-700 bg-red-50 border-red-200'
                              : prod.stockQuantity <= 3
                              ? 'text-amber-800 bg-amber-50 border-amber-200'
                              : 'text-[#29231F] bg-[#FAF8F4] border-[#E8E0D7]'
                          }`}
                        >
                          {prod.stockQuantity}
                        </span>
                        <button
                          onClick={() => handleQuickStockChange(prod.id, prod.stockQuantity, 1)}
                          className="p-1 border border-[#E8E0D7] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                          title="Augmenter stock (+1)"
                        >
                          <Plus className="w-3 h-3 text-[#29231F]" />
                        </button>
                        
                      </div>
                    </td>

                    {/* Status with Red Banner notice if 0 */}
                    <td className="py-3 px-4">
                      {avail.isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 uppercase">
                          <AlertOctagon className="w-3 h-3" />
                          Épuisé (Bannière active)
                        </span>
                      ) : avail.status === 'limited_stock' ? (
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5">
                           Limité
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                          En stock
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setDuplicateModal(prod);
                            setDuplicateColorName('');
                          }}
                          title="Dupliquer ce modèle pour créer une nouvelle couleur"
                          className="p-1.5 text-[#8C8178] hover:text-[#765343] border border-[#E8E0D7] hover:border-[#8C8178] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditProduct(prod)}
                          title="Modifier"
                          className="p-1.5 text-[#29231F] hover:text-[#765343] border border-[#E8E0D7] hover:border-[#8C8178] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProduct(prod)}
                          title="Supprimer ce sac"
                          className="p-1.5 text-red-600 hover:text-red-800 border border-[#E8E0D7] hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* IN-APP DELETE CONFIRMATION MODAL (Replaces window.confirm) */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E8E0D7] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2 bg-red-50 rounded-full border border-red-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#29231F]">
                Supprimer ce sac ?
              </h3>
            </div>

            <p className="text-xs text-[#8C8178] leading-relaxed">
              Confirmez-vous la suppression définitive du modèle{' '}
              <strong className="text-[#29231F]">
                {deleteConfirmProduct.name} ({deleteConfirmProduct.color})
              </strong>{' '}
              ? Il sera immédiatement retiré de la boutique et de Firebase.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E0D7]">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 text-xs uppercase tracking-wider text-[#8C8178] hover:text-[#29231F] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Product Modal */}
      {duplicateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E0D7] p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-serif text-xl text-[#29231F]">
              Dupliquer pour une nouvelle couleur
            </h3>
            <p className="text-xs text-[#8C8178] leading-relaxed">
              Crée un nouveau produit indépendant basé sur <strong>{duplicateModal.name}</strong> avec un stock initial de 10 unités.
            </p>
            <form onSubmit={handleDuplicateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Nom de la nouvelle couleur *
                </label>
                <input
                  type="text"
                  required
                  value={duplicateColorName}
                  onChange={(e) => setDuplicateColorName(e.target.value)}
                  placeholder="ex: Rose Poudré, Bleu Ciel, Kaki..."
                  className="w-full px-3 py-2 text-sm border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDuplicateModal(null)}
                  className="px-3.5 py-2 text-xs uppercase tracking-wider text-[#8C8178] hover:text-[#29231F] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-[#29231F] hover:bg-[#765343] text-white transition-colors cursor-pointer"
                >
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
