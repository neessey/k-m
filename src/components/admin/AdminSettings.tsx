import React, { useState } from 'react';
import { Save, Check, RefreshCw, Phone, ShieldCheck, Database } from 'lucide-react';
import { SellerConfig } from '../../types';
import { db } from '../../services/db';

interface AdminSettingsProps {
  config: SellerConfig;
  onConfigUpdated: (config: SellerConfig) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  config,
  onConfigUpdated,
}) => {
  const [shopName, setShopName] = useState(config.shopName);
  const [whatsappPhone, setWhatsappPhone] = useState(config.whatsappPhone);
  const [city, setCity] = useState(config.city);
  const [currency, setCurrency] = useState(config.currency);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');

    const updated = db.updateConfig({
      shopName: shopName.trim(),
      whatsappPhone: cleanPhone,
      displayPhone: `+${cleanPhone}`,
      city: city.trim(),
      currency: currency.trim(),
    });

    onConfigUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    db.resetToDefaults();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-200">
      {/* Title */}
      <div className="pb-6 border-b border-[#E8E0D7]">
        <h1 className="font-serif text-3xl text-[#29231F] font-normal">
          Paramètres de la boutique
        </h1>
        <p className="text-xs text-[#8C8178] mt-1">
          Coordonnées de réception des commandes WhatsApp et configuration générale.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 border border-[#E8E0D7] space-y-5">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[#765343]">
          Informations Vendeuse
        </h3>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
            Nom de la boutique
          </label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
            Numéro WhatsApp de réception des commandes
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="ex: 2250140586280 (chiffres sans + ni espaces)"
              className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
            />
            <Phone className="w-4 h-4 text-[#25D366] absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-[#8C8178] mt-1">
            Tous les messages de commande et de précommande seront automatiquement adressés à ce numéro.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
              Ville
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
              Devise
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF8F4] border border-[#E8E0D7] focus:border-[#765343] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs uppercase tracking-wider font-medium text-white bg-[#29231F] hover:bg-[#765343] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Enregistré avec succès !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </>
            )}
          </button>
        </div>
      </form>

    
    </div>
  );
};
