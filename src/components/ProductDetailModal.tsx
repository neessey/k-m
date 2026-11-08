import React from 'react';
import { X, ArrowRight, AlertOctagon, Check } from 'lucide-react';
import { Product, getProductAvailability } from '../types';
import { formatPrice } from '../config/seller';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onOrder: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOrder,
}) => {
  const availability = getProductAvailability(product.stockQuantity);
  const isOutOfStock = availability.isOutOfStock;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#29231F]/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FAF8F4] w-full max-w-3xl border border-[#E8E0D7] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-[#FAF8F4]/90 text-[#29231F] border border-[#E8E0D7] hover:bg-white transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Image */}
          <div className="bg-[#F1ECE5] p-5 sm:p-6 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-[#E8E0D7]">
            <div className="relative aspect-square w-full max-w-sm overflow-hidden bg-white border border-[#E8E0D7]">
              <img
                src={product.imageUrl}
                alt={`${product.name} ${product.color}`}
                className={`w-full h-full object-cover object-center ${
                  isOutOfStock ? 'opacity-90 grayscale-15' : ''
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Red banner if out of stock */}
              {isOutOfStock ? (
                <div className="absolute top-0 inset-x-0 bg-red-700/95 text-white py-2 px-3 text-center shadow-md flex items-center justify-center gap-1.5 z-10">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold">
                    CE SAC EST ÉPUISÉ
                  </span>
                </div>
              ) : (
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-[#FAF8F4]/95 border border-[#E8E0D7]">
                    {availability.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="p-5 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#765343] font-medium">
                  K&M beauty 
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#29231F] font-normal mt-0.5">
                  {product.name}
                </h2>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-[#29231F] tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Color */}
              <div className="flex items-center gap-2 text-xs py-2 border-y border-[#E8E0D7]">
                <span className="text-[#8C8178]">Couleur spécifique :</span>
                <span className="font-semibold text-[#29231F] flex items-center gap-1.5">
                
                  {product.color}
                </span>
              </div>

              

              {/* Accessories */}
              <div className="space-y-1.5 text-xs text-[#8C8178]">
                <span className="uppercase tracking-wider text-[#29231F] font-medium text-[11px] block">
                  Accessoires inclus :
                </span>
                <ul className="space-y-1">
                  {product.accessories && product.accessories.length > 0 ? (
                    product.accessories.map((acc, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-[#765343]" />
                        <span>{acc}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-[11px] text-[#8C8178]">Bandoulière et pochon inclus</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Direct Order or Preorder */}
            <div className="pt-2 border-t border-[#E8E0D7]">
              <button
                onClick={() => {
                  onClose();
                  onOrder(product);
                }}
                className={`w-full min-h-[46px] py-3.5 px-4 text-xs uppercase tracking-[0.16em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  isOutOfStock
                    ? 'bg-[#765343] hover:bg-[#5d3f32] text-[#FAF8F4]'
                    : 'bg-[#29231F] hover:bg-[#765343] text-[#FAF8F4]'
                }`}
              >
                <span>{availability.buttonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
