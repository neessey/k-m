export type AvailabilityStatus = 'in_stock' | 'limited_stock' | 'out_of_stock';

export type OrderStatus = 'en_attente' | 'confirmee' | 'finalisee' | 'annulee';

export type PreorderStatus = 'nouvelle' | 'contactee' | 'disponible' | 'terminee' | 'annulee';

export interface Product {
  id: string;
  name: string;
  color: string;
  price: number; // in FCFA
  stockQuantity: number; // default 10
  accessories: string[];
  imageUrl: string;
  additionalImages?: string[];
  category?: 'bandouliere' | 'porte-main' | 'cabas' | 'pochette';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  nom: string;
  prenom: string;
  telephone: string;
  ville?: string;
  note?: string;
}

export interface Order {
  id: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  productId: string;
  productNameSnapshot: string;
  productColorSnapshot: string;
  productImageSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  stockDeducted: boolean;
  createdAt: string;
  updatedAt: string;
  whatsappMessage?: string;
  whatsappUrl?: string;
}

export interface Preorder {
  id: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  productId: string;
  productNameSnapshot: string;
  productColorSnapshot: string;
  productImageSnapshot: string;
  quantity: number;
  unitPrice: number;
  status: PreorderStatus;
  createdAt: string;
  updatedAt: string;
  whatsappMessage?: string;
  whatsappUrl?: string;
}

export interface SellerConfig {
  shopName: string;
  whatsappPhone: string;
  displayPhone: string;
  city: string;
  country: string;
  currency: string;
  adminEmail: string;
}

export function getProductAvailability(stock: number): {
  status: AvailabilityStatus;
  label: string;
  isOutOfStock: boolean;
  buttonLabel: 'Commander' | 'Précommander';
} {
  if (stock <= 0) {
    return {
      status: 'out_of_stock',
      label: 'Épuisé',
      isOutOfStock: true,
      buttonLabel: 'Précommander',
    };
  }
  if (stock <= 3) {
    return {
      status: 'limited_stock',
      label: `Stock limité (${stock} restants)`,
      isOutOfStock: false,
      buttonLabel: 'Commander',
    };
  }
  return {
    status: 'in_stock',
    label: 'En stock',
    isOutOfStock: false,
    buttonLabel: 'Commander',
  };
}
