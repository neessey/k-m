import React, { useState } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../config/seller';
import { db } from '../../services/db';

interface AdminOrdersProps {
  orders: Order[];
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders }) => {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [statusMessage, setStatusMessage] = useState<{ id: string; text: string; isError?: boolean } | null>(null);

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const res = db.updateOrderStatus(orderId, newStatus);
    if (res.error) {
      setStatusMessage({ id: orderId, text: res.error, isError: true });
    } else {
      let msg = 'Statut mis à jour.';
      if (newStatus === 'annulee') {
        msg = 'Commande annulée : stock restauré (+1 sac).';
      } else if (newStatus === 'confirmee') {
        msg = 'Commande confirmée.';
      }
      setStatusMessage({ id: orderId, text: msg, isError: false });
    }

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D7]">
        <div>
          <h1 className="font-serif text-3xl text-[#29231F] font-normal">
            Commandes reçues ({orders.length})
          </h1>
          <p className="text-xs text-[#8C8178] mt-1">
            Dès qu'un sac atteint 0 unité, il devient immédiatement <strong>« Épuisé »</strong>.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-[#F1ECE5] p-1 border border-[#E8E0D7] text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'en_attente', label: 'En attente' },
            { id: 'confirmee', label: 'Confirmées' },
            { id: 'finalisee', label: 'Finalisées' },
            { id: 'annulee', label: 'Annulées' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filter === f.id
                  ? 'bg-white text-[#29231F] shadow-2xs'
                  : 'text-[#8C8178] hover:text-[#29231F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-[#E8E0D7] overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F1ECE5]/70 border-b border-[#E8E0D7] uppercase tracking-wider text-[11px] text-[#8C8178]">
            <tr>
              <th className="py-3 px-4">Réf & Date</th>
              <th className="py-3 px-4">Cliente & Contact</th>
              <th className="py-3 px-4">Sac commandé</th>
              <th className="py-3 px-4">Montant</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D7]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8C8178]">
                  Aucune commande dans cette catégorie.
                </td>
              </tr>
            ) : (
              filtered.map((ord) => {
                const isMsg = statusMessage?.id === ord.id;
                return (
                  <tr key={ord.id} className="hover:bg-[#FAF8F4]/80 transition-colors">
                    {/* Ref & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-[#29231F] block">
                        {ord.id}
                      </span>
                      <span className="text-[10px] text-[#8C8178]">
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#29231F]">
                        {ord.customerFirstName} {ord.customerLastName}
                      </p>
                      <a
                        href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] hover:underline font-mono text-[11px] flex items-center gap-1 mt-0.5"
                      >
                        <MessageCircle className="w-3 h-3 fill-current" />
                        <span>{ord.customerPhone}</span>
                      </a>
                    </td>

                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ord.productImageSnapshot}
                          alt={ord.productNameSnapshot}
                          className="w-10 h-10 object-cover border border-[#E8E0D7] bg-[#F1ECE5] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[#29231F] truncate">
                            {ord.productNameSnapshot}
                          </p>
                          <span className="text-[11px] text-[#8C8178]">
                            Couleur : <strong>{ord.productColorSnapshot}</strong> (qté: {ord.quantity})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-semibold text-[#29231F] tabular-nums">
                      {formatPrice(ord.totalPrice)}
                    </td>

                    {/* Status & Stock deduction flag */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs ${
                            ord.status === 'confirmee'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'finalisee'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'annulee'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status === 'en_attente' && 'En attente'}
                          {ord.status === 'confirmee' && 'Confirmée'}
                          {ord.status === 'finalisee' && 'Finalisée'}
                          {ord.status === 'annulee' && 'Annulée'}
                        </span>

                        <span className="block text-[10px] text-[#8C8178]">
                          {ord.stockDeducted ? 'Stock décrémenté ✓' : 'Stock non débité'}
                        </span>

                        {isMsg && (
                          <p
                            className={`text-[10px] font-medium p-1 border ${
                              statusMessage.isError
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {statusMessage.text}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Action dropdown or quick buttons */}
                    <td className="py-3 px-4 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className="text-xs bg-[#FAF8F4] border border-[#E8E0D7] px-2 py-1.5 focus:border-[#765343] focus:outline-none cursor-pointer"
                      >
                        <option value="en_attente">En attente</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="finalisee">Finalisée</option>
                        <option value="annulee">Annulée (restaure le stock)</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
