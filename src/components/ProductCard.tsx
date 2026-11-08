import React from 'react';
import { ArrowRight, Eye, AlertOctagon } from 'lucide-react';
import { Product, getProductAvailability } from '../types';
import { formatPrice } from '../config/seller';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onOrderClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOrderClick,
}) => {
  const availability = getProductAvailability(product.stockQuantity);
  const isOutOfStock = availability.isOutOfStock;

  return (
    <div className="bg-[#FAF8F4] border border-[#E8E0D7] hover:border-[#8C8178] transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs relative group">
      {/* Product Image Stage */}
      <div
        className="relative aspect-[4/3] bg-[#F1ECE5] overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={product.imageUrl}
          alt={`${product.name} - ${product.color}`}
          className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103 ${
            isOutOfStock ? 'opacity-90 grayscale-15' : ''
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* ELEGANT RED BANNER FOR OUT OF STOCK (Strictly required) */}
        {isOutOfStock ? (
          <div className="absolute top-0 inset-x-0 bg-red-700/95 text-white py-2 px-3 text-center shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 z-10 animate-in fade-in">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">
              CE SAC EST ÉPUISÉ
            </span>
          </div>
        ) : (
          /* Subtle Stock Tag */
          <div className="absolute top-3 right-3">
            {availability.status === 'limited_stock' ? (
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#765343] bg-[#FAF8F4]/95 px-2.5 py-1 border border-[#E8E0D7] shadow-xs">
                {availability.label}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#29231F] bg-[#FAF8F4]/95 px-2.5 py-1 border border-[#E8E0D7] shadow-xs">
                En stock ({product.stockQuantity})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              onClick={() => onSelectProduct(product)}
              className="font-serif text-l sm:text-2xl text-[#29231F] hover:text-[#765343] transition-colors cursor-pointer truncate"
            >
              {product.name}
            </h3>
          </div>

          {/* Color specification - Independent product */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8C8178]">Couleur :</span>
            <span className="font-medium text-[#29231F] flex items-center gap-1.5">
             
              {product.color}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
             <span className="font-sans text-base sm:text-lg font-semibold text-[#29231F] tabular-nums whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>

          

        
        </div>

        {/* Action Button: Commander or Précommander */}
        <div className="pt-2">
          <button
            onClick={() => onOrderClick(product)}
            className={`w-full min-h-[46px] py-3 px-4 text-xs uppercase tracking-[0.16em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isOutOfStock
                ? 'bg-[#765343] hover:bg-[#5d3f32] text-[#FAF8F4]'
                : 'bg-[#29231F] hover:bg-[#765343] text-[#FAF8F4]'
            }`}
          >
            <span>{availability.buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
