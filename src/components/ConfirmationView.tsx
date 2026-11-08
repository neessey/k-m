import React from 'react';
import { Check, MessageCircle, ArrowLeft } from 'lucide-react';
import { Order, Preorder } from '../types';
import { formatPrice } from '../config/seller';

interface ConfirmationViewProps {
  record: Order | Preorder;
  type: 'commande' | 'precommande';
  onBackToShop: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  record,
  type,
  onBackToShop,
}) => {
  const isPreorder = type === 'precommande';

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center animate-in fade-in duration-200">
      <div className="max-w-xl w-full bg-[#FAF8F4] border border-[#E8E0D7] p-6 sm:p-10 shadow-lg relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#765343]" />

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F1ECE5] border border-[#E8E0D7] mx-auto flex items-center justify-center text-[#765343]">
            <Check className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#765343] font-semibold">
              {isPreorder ? 'Précommande enregistrée' : 'Commande préparée'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#29231F] font-normal">
              Merci {record.customerFirstName} !
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8178] max-w-md mx-auto leading-relaxed">
              {isPreorder
                ? 'Votre demande de précommande a bien été enregistrée par K&M beauty. La vendeuse vous recontactera dès la disponibilité de votre sac.'
                : 'Votre commande a bien été transmise à notre boutique. Si WhatsApp ne s’est pas ouvert automatiquement, appuyez sur le bouton ci-dessous.'}
            </p>
          </div>
        </div>

        {/* WhatsApp Button */}
        {record.whatsappUrl && (
          <div className="my-6">
            <a
              href={record.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[46px] py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Ouvrir WhatsApp avec mon message</span>
            </a>
          </div>
        )}

        {/* Recap */}
        <div className="border border-[#E8E0D7] divide-y divide-[#E8E0D7] text-xs">
          <div className="p-3.5 bg-white flex items-center gap-3">
            <img
              src={record.productImageSnapshot}
              alt={record.productNameSnapshot}
              className="w-14 h-14 object-cover border border-[#E8E0D7] shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-base text-[#29231F] font-medium truncate">
                {record.productNameSnapshot}
              </h4>
              <p className="text-[#8C8178] flex items-center gap-1.5 mt-0.5">
                <span>Couleur : <strong className="text-[#29231F]">{record.productColorSnapshot}</strong></span>
              </p>
              <p className="text-[11px] text-[#765343] mt-0.5">
                {isPreorder ? 'Précommande (Épuisé)' : 'Commande (En stock)'}
              </p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-sm text-[#29231F] tabular-nums">
                {formatPrice(record.unitPrice)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-white/50 space-y-1.5 text-[#8C8178]">
            <div className="flex justify-between">
              <span>Cliente :</span>
              <span className="text-[#29231F] font-medium">
                {record.customerFirstName} {record.customerLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Téléphone :</span>
              <span className="text-[#29231F] font-mono">{record.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Référence :</span>
              <span className="text-[#29231F] font-mono">{record.id}</span>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onBackToShop}
            className="w-full py-3 px-4 text-xs uppercase tracking-wider font-medium text-[#29231F] hover:text-[#765343] border border-[#E8E0D7] hover:border-[#8C8178] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la boutique K&M beauty</span>
          </button>
        </div>
      </div>
    </div>
  );
};
