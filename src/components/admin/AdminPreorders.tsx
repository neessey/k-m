import React, { useState } from 'react';
import { Clock, MessageCircle, CheckCircle2, User, ExternalLink } from 'lucide-react';
import { Preorder, PreorderStatus } from '../../types';
import { formatPrice } from '../../config/seller';
import { db } from '../../services/db';

interface AdminPreordersProps {
  preorders: Preorder[];
}

export const AdminPreorders: React.FC<AdminPreordersProps> = ({ preorders }) => {
  const [filter, setFilter] = useState<'all' | PreorderStatus>('all');

  const filtered = preorders.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleStatusChange = (preorderId: string, newStatus: PreorderStatus) => {
    db.updatePreorderStatus(preorderId, newStatus);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D7]">
        <div>
          <h1 className="font-serif text-3xl text-[#29231F] font-normal">
            Précommandes ({preorders.length})
          </h1>
          <p className="text-xs text-[#8C8178] mt-1">
            Demandes sur sacs épuisés. <strong>Une précommande n'impacte jamais le stock physique</strong>.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-[#F1ECE5] p-1 border border-[#E8E0D7] text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'nouvelle', label: 'Nouvelles' },
            { id: 'contactee', label: 'Contactées' },
            { id: 'disponible', label: 'Disponibles' },
            { id: 'terminee', label: 'Terminées' },
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

      {/* Preorders Table */}
      <div className="bg-white border border-[#E8E0D7] overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F1ECE5]/70 border-b border-[#E8E0D7] uppercase tracking-wider text-[11px] text-[#8C8178]">
            <tr>
              <th className="py-3 px-4">Réf & Date</th>
              <th className="py-3 px-4">Cliente & WhatsApp</th>
              <th className="py-3 px-4">Modèle & Teinte demandée</th>
              <th className="py-3 px-4">Prix</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D7]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8C8178]">
                  Aucune précommande enregistrée.
                </td>
              </tr>
            ) : (
              filtered.map((pre) => {
                return (
                  <tr key={pre.id} className="hover:bg-[#FAF8F4]/80 transition-colors">
                    {/* Ref & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-[#29231F] block">
                        {pre.id}
                      </span>
                      <span className="text-[10px] text-[#8C8178]">
                        {new Date(pre.createdAt).toLocaleDateString('fr-FR', {
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
                        {pre.customerFirstName} {pre.customerLastName}
                      </p>
                      <a
                        href={`https://wa.me/${pre.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${pre.customerFirstName}, nous vous contactons concernant votre précommande pour le ${pre.productNameSnapshot} en coloris ${pre.productColorSnapshot} chez K&M beauty !`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] hover:underline font-mono text-[11px] flex items-center gap-1 mt-0.5"
                      >
                        <MessageCircle className="w-3 h-3 fill-current" />
                        <span>Contacter {pre.customerPhone}</span>
                      </a>
                    </td>

                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={pre.productImageSnapshot}
                          alt={pre.productNameSnapshot}
                          className="w-10 h-10 object-cover border border-[#E8E0D7] bg-[#F1ECE5] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[#29231F] truncate">
                            {pre.productNameSnapshot}
                          </p>
                          <span className="text-[11px] text-[#765343] font-medium">
                            Couleur souhaitée : {pre.productColorSnapshot}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-semibold text-[#29231F] tabular-nums">
                      {formatPrice(pre.unitPrice)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs ${
                          pre.status === 'nouvelle'
                            ? 'bg-amber-100 text-amber-800'
                            : pre.status === 'contactee'
                            ? 'bg-purple-100 text-purple-800'
                            : pre.status === 'disponible'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pre.status === 'terminee'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {pre.status === 'nouvelle' && 'Nouvelle'}
                        {pre.status === 'contactee' && 'Cliente contactée'}
                        {pre.status === 'disponible' && 'Sac disponible'}
                        {pre.status === 'terminee' && 'Terminée'}
                        {pre.status === 'annulee' && 'Annulée'}
                      </span>
                    </td>

                    {/* Action Selector */}
                    <td className="py-3 px-4 text-right">
                      <select
                        value={pre.status}
                        onChange={(e) => handleStatusChange(pre.id, e.target.value as PreorderStatus)}
                        className="text-xs bg-[#FAF8F4] border border-[#E8E0D7] px-2 py-1.5 focus:border-[#765343] focus:outline-none cursor-pointer"
                      >
                        <option value="nouvelle">Nouvelle</option>
                        <option value="contactee">Cliente contactée</option>
                        <option value="disponible">Sac disponible</option>
                        <option value="terminee">Terminée</option>
                        <option value="annulee">Annulée</option>
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
