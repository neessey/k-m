import React, { useState } from 'react';
import { X, MessageCircle, ArrowRight, Phone } from 'lucide-react';
import { CustomerInfo, Order, Preorder, Product, getProductAvailability } from '../types';
import { formatPrice, generateWhatsAppMessage } from '../config/seller';
import { db } from '../services/db';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onComplete: (record: Order | Preorder, type: 'commande' | 'precommande') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  onClose,
  onComplete,
}) => {
  const [formData, setFormData] = useState<CustomerInfo>({
    nom: '',
    prenom: '',
    telephone: '',
    ville: 'Abidjan',
    note: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availability = getProductAvailability(product.stockQuantity);
  const isPreorder = availability.isOutOfStock;
  const typeLabel = isPreorder ? 'Précommande' : 'Commande';

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Veuillez renseigner votre prénom.';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Veuillez renseigner votre nom.';
    }

    const cleanTel = formData.telephone.replace(/[\s\-\.]/g, '');
    if (!cleanTel) {
      newErrors.telephone = 'Votre numéro WhatsApp est obligatoire.';
    } else if (cleanTel.length < 8) {
      newErrors.telephone = 'Numéro de téléphone incomplet.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Build the WhatsApp message
    const messageResult = generateWhatsAppMessage(formData, product);

    // Persist in DB (Orders vs Preorders)
    let savedRecord: Order | Preorder;

    if (!isPreorder) {
      savedRecord = db.createOrder({
        customerFirstName: formData.prenom,
        customerLastName: formData.nom,
        customerPhone: formData.telephone,
        product,
        quantity: 1,
        whatsappMessage: messageResult.text,
        whatsappUrl: messageResult.url,
      });
    } else {
      savedRecord = db.createPreorder({
        customerFirstName: formData.prenom,
        customerLastName: formData.nom,
        customerPhone: formData.telephone,
        product,
        quantity: 1,
        whatsappMessage: messageResult.text,
        whatsappUrl: messageResult.url,
      });
    }

    // Open WhatsApp Click-to-Chat
    try {
      window.open(messageResult.url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = messageResult.url;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete(savedRecord, isPreorder ? 'precommande' : 'commande');
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#29231F]/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FAF8F4] w-full max-w-lg border border-[#E8E0D7] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E0D7] bg-[#F1ECE5]/60">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#765343] font-medium block">
              K&M beauty
            </span>
            <h2 className="font-serif text-2xl text-[#29231F] font-normal">
              {isPreorder ? 'Finaliser ma précommande' : 'Finaliser ma commande'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8C8178] hover:text-[#29231F] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Selected Product Card */}
          <div className="p-3.5 bg-[#F1ECE5] border border-[#E8E0D7] flex items-center gap-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover bg-white border border-[#E8E0D7] shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-lg text-[#29231F] font-medium truncate">
                {product.name}
              </h4>
              <p className="text-xs text-[#8C8178] flex items-center gap-1.5 mt-0.5">
                <span>Couleur : <strong className="text-[#29231F]">{product.color}</strong></span>
                
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold text-sm text-[#29231F] tabular-nums">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[11px] font-medium text-[#765343]">
                  {typeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Prénom <span className="text-[#765343]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="ex: Aminata"
                  className={`w-full px-3 py-2.5 text-sm bg-white border ${
                    errors.prenom ? 'border-red-400' : 'border-[#E8E0D7] focus:border-[#765343]'
                  } focus:outline-none`}
                />
                {errors.prenom && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.prenom}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                  Nom <span className="text-[#765343]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: Kouassi"
                  className={`w-full px-3 py-2.5 text-sm bg-white border ${
                    errors.nom ? 'border-red-400' : 'border-[#E8E0D7] focus:border-[#765343]'
                  } focus:outline-none`}
                />
                {errors.nom && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.nom}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#29231F] font-medium mb-1">
                Numéro WhatsApp <span className="text-[#765343]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="ex: 01 40 58 62 80"
                  className={`w-full px-3 py-2.5 text-sm bg-white border ${
                    errors.telephone ? 'border-red-400' : 'border-[#E8E0D7] focus:border-[#765343]'
                  } focus:outline-none`}
                />
                <Phone className="w-4 h-4 text-[#25D366] absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#8C8178] mt-1">
                La vendeuse vous répondra directement sur ce numéro.
              </p>
              {errors.telephone && (
                <p className="text-[11px] text-red-600 mt-1">{errors.telephone}</p>
              )}
            </div>

            {/* Note */}
            <p className="text-[11px] text-[#8C8178] text-center pt-1">
              WhatsApp s'ouvrira directement avec votre message pré-rempli.
            </p>

            {/* Action CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3.5 px-6 text-xs uppercase tracking-[0.16em] font-medium text-[#FAF8F4] bg-[#29231F] hover:bg-[#765343] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow disabled:opacity-75"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
              <span>
                {isSubmitting
                  ? 'Génération...'
                  : isPreorder
                  ? 'Envoyer ma précommande sur WhatsApp'
                  : 'Envoyer ma commande sur WhatsApp'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
