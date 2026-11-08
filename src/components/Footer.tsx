import React from 'react';
import { MessageCircle, Shield } from 'lucide-react';
import { SellerConfig } from '../types';

interface FooterProps {
  sellerConfig: SellerConfig;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  sellerConfig,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#29231F] text-[#FAF8F4] py-8 border-t border-[#E8E0D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          
          <button
            onClick={onOpenAdmin}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[#C5A783]"
          >
          <span className="font-serif text-lg tracking-[0.18em]">
            {sellerConfig.shopName.toUpperCase()}
          </span>
        </button>
        </div>

        <div className="flex items-center gap-4 text-[#FAF8F4]/70">
          <a
            href={`https://wa.me/${sellerConfig.whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
            <span>WhatsApp : {sellerConfig.displayPhone}</span>
          </a>

         

         
        </div>
      </div>
    </footer>
  );
};
