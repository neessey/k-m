import { CustomerInfo, Product, SellerConfig, getProductAvailability } from '../types';
import { db } from '../services/db';

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

export function generateWhatsAppMessage(
  customer: CustomerInfo,
  product: Product
): { text: string; url: string; type: 'commande' | 'precommande' } {
  const availability = getProductAvailability(product.stockQuantity);
  const isPreorder = availability.isOutOfStock;
  const typeLabel = isPreorder ? 'Précommande' : 'Commande';

  const customerFullName = `${customer.prenom.trim()} ${customer.nom.trim()}`.trim();
  const phoneFormatted = customer.telephone.trim();
  const priceFormatted = formatPrice(product.price);

  let messageBody = '';

  if (!isPreorder) {
    messageBody = `Bonjour ! Nouvelle commande reçue.

Cliente : ${customerFullName}
Téléphone : ${phoneFormatted}${customer.ville ? `\nVille : ${customer.ville.trim()}` : ''}${customer.note ? `\nNote : ${customer.note.trim()}` : ''}

Produit : ${product.name}
Couleur : ${product.color}
Prix : ${priceFormatted}
Type : Commande
Statut : ${availability.label}

Merci de contacter la cliente pour finaliser la commande.`;
  } else {
    messageBody = `Bonjour ! Nouvelle précommande reçue.

Cliente : ${customerFullName}
Téléphone : ${phoneFormatted}${customer.ville ? `\nVille : ${customer.ville.trim()}` : ''}${customer.note ? `\nNote : ${customer.note.trim()}` : ''}

Produit : ${product.name}
Couleur : ${product.color}
Prix : ${priceFormatted}
Type : Précommande
Statut : Épuisé

La cliente souhaite être contactée lorsque le sac sera disponible.`;
  }

  const config = db.getConfig();
  const cleanPhone = config.whatsappPhone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(messageBody);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  return {
    text: messageBody,
    url,
    type: isPreorder ? 'precommande' : 'commande',
  };
}
