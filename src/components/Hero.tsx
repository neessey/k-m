import React from 'react';
import { ArrowDown } from 'lucide-react';
import HERO_IMAGE from '../assets/images/hero.png';

interface HeroProps {
  onDiscoverClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onDiscoverClick }) => {
  return (
    <section className="relative bg-[#FAF8F4] border-b border-[#E8E0D7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Dominant Visual (Mobile-first priority & Desktop beauty) */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-4/3 sm:aspect-16/10 overflow-hidden bg-sand border border-border-subtle shadow-sm">
              <img
                src={HERO_IMAGE}
                alt="Sac K&M beauty"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Minimalist Text Hook */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#765343] font-medium block">
                K&M beauty
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#29231F] font-normal tracking-tight leading-[1.1] text-balance">
                L'élégance au quotidien.
              </h1>
            </div>

            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                onClick={onDiscoverClick}
                className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium text-[#FAF8F4] bg-[#29231F] hover:bg-[#765343] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow"
              >
                <span>Voir les sacs</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
