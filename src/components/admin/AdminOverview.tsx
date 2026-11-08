import React from 'react';
import {
  Package,
  ShoppingBag,
  Clock,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { Order, Preorder, Product } from '../../types';
import { formatPrice } from '../../config/seller';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewProps {
  products: Product[];
  orders: Order[];
  preorders: Preorder[];
  onNavigate: (tab: AdminTab) => void;
  onEditProduct: (product: Product) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  products,
  orders,
  preorders,
  onNavigate,
  onEditProduct,
}) => {
  // Calculations
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 3);
  const totalOrders = orders.length;
  const totalPreorders = preorders.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D7]">
        <div>
          <h1 className="font-serif text-3xl text-[#29231F] font-normal">
            Vue d'ensemble
          </h1>
          <p className="text-xs text-[#8C8178] mt-1">
            Indicateurs clés de la boutique K&M beauty et alertes de stock en temps réel.
          </p>
        </div>

        <button
          onClick={() => onNavigate('add_product')}
          className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-white bg-[#29231F] hover:bg-[#765343] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un sac</span>
        </button>
      </div>

      {/* KPI Cards (Clean, unboxed per guidelines, no garish colors) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 sm:p-5 border border-[#E8E0D7] space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[#8C8178] font-medium block">
            Produits enregistrés
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-semibold text-[#29231F] tabular-nums">
            {totalProducts}
          </p>
          <span className="text-[10px] text-[#8C8178]">
            1 couleur = 1 produit
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 sm:p-5 border border-[#E8E0D7] space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[#8C8178] font-medium block">
            Sacs en stock
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-semibold text-[#765343] tabular-nums">
            {totalStockUnits}
          </p>
          <span className="text-[10px] text-[#8C8178]">
            Unités réelles disponibles
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 sm:p-5 border border-[#E8E0D7] space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[#8C8178] font-medium block">
            Commandes reçues
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-semibold text-[#29231F] tabular-nums">
            {totalOrders}
          </p>
          <span className="text-[10px] text-[#8C8178]">
            Via WhatsApp
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 sm:p-5 border border-[#E8E0D7] space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[#8C8178] font-medium block">
            Précommandes
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-semibold text-[#29231F] tabular-nums">
            {totalPreorders}
          </p>
          <span className="text-[10px] text-[#8C8178]">
            Sur sacs épuisés
          </span>
        </div>

        {/* Card 5 */}
        <div className={`p-4 sm:p-5 border space-y-1 ${
          outOfStockProducts.length > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-[#E8E0D7]'
        }`}>
          <span className="text-[11px] uppercase tracking-wider text-red-800 font-medium block">
            Sacs épuisés
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-semibold text-red-700 tabular-nums">
            {outOfStockProducts.length}
          </p>
          <span className="text-[10px] text-red-600">
            Bannière rouge active
          </span>
        </div>
      </div>

      {/* Two columns: Recent Orders & Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-7 bg-white border border-[#E8E0D7] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D7]">
            <div>
              <h3 className="font-serif text-xl text-[#29231F] font-medium">
                Dernières commandes reçues
              </h3>
              <p className="text-[11px] text-[#8C8178]">
                Commandes transmises par les clientes
              </p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-[#765343] hover:underline font-medium cursor-pointer"
            >
              Voir tout ({orders.length})
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-[#8C8178] py-8 text-center">
              Aucune commande pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-[#E8E0D7] text-xs">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={ord.productImageSnapshot}
                      alt={ord.productNameSnapshot}
                      className="w-10 h-10 object-cover border border-[#E8E0D7] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[#29231F] truncate">
                        {ord.productNameSnapshot} · {ord.productColorSnapshot}
                      </p>
                      <p className="text-[#8C8178] text-[11px]">
                        {ord.customerFirstName} {ord.customerLastName} · {ord.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-semibold text-[#29231F] tabular-nums block">
                      {formatPrice(ord.totalPrice)}
                    </span>
                    <span className={`text-[10px] uppercase font-medium ${
                      ord.status === 'confirmee' ? 'text-emerald-700' :
                      ord.status === 'annulee' ? 'text-red-600' :
                      ord.status === 'finalisee' ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      {ord.status === 'en_attente' ? 'En attente' :
                       ord.status === 'confirmee' ? 'Confirmée' :
                       ord.status === 'finalisee' ? 'Finalisée' : 'Annulée'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Low Stock & Out of Stock Alerts */}
        <div className="lg:col-span-5 bg-white border border-[#E8E0D7] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D7]">
            <div>
              <h3 className="font-serif text-xl text-[#29231F] font-medium">
                Alertes de stock
              </h3>
              <p className="text-[11px] text-[#8C8178]">
                Sacs épuisés ou nécessitant un réassort
              </p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-[#765343] hover:underline font-medium cursor-pointer"
            >
              Gérer les stocks
            </button>
          </div>

          <div className="space-y-3">
            {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-800 bg-emerald-50 p-4 border border-emerald-200">
                ✓ Tous les stocks sont au niveau optimal (&gt; 3 unités).
              </p>
            ) : (
              <>
                {/* Out of stock list */}
                {outOfStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-red-50/60 border border-red-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-red-950 truncate">
                          {p.name} ({p.color})
                        </p>
                        <span className="text-[10px] uppercase font-bold text-red-700">
                          Épuisé (0 unité) · Précommandes actives
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onEditProduct(p)}
                      className="px-2.5 py-1 text-[11px] bg-red-700 text-white hover:bg-red-800 transition-colors cursor-pointer shrink-0"
                    >
                      Réapprovisionner
                    </button>
                  </div>
                ))}

                {/* Low stock list */}
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-amber-950 truncate">
                          {p.name} ({p.color})
                        </p>
                        <span className="text-[10px] text-amber-800 font-medium">
                          Stock limité : {p.stockQuantity} unité{p.stockQuantity > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onEditProduct(p)}
                      className="px-2.5 py-1 text-[11px] border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                    >
                      Modifier stock
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
