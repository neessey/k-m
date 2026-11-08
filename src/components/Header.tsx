import React from 'react';
import { MessageCircle, Shield, ShoppingBag } from 'lucide-react';
import { SellerConfig } from '../types';

interface HeaderProps {
  sellerConfig: SellerConfig;
  onOpenAdmin: () => void;
  onScrollToCatalog: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sellerConfig,
  onOpenAdmin,
  onScrollToCatalog,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#E8E0D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-center gap-4">
        {/* Brand */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-left cursor-pointer group"
        >
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.18em] font-medium text-[#29231F] group-hover:text-[#765343] transition-colors">
            {sellerConfig.shopName.toUpperCase()}
          </span>
        </button>

      </div>
    </header>
  );
};
