import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Clock,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'add_product'
  | 'orders'
  | 'preorders'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onGoToShop: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  orderCount?: number;
  preorderCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onGoToShop,
  mobileOpen,
  onCloseMobile,
  orderCount = 0,
  preorderCount = 0,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'overview',
      label: "Vue d'ensemble",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'Mes produits',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'add_product',
      label: 'Ajouter un produit',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: orderCount,
    },
    {
      id: 'preorders',
      label: 'Précommandes',
      icon: <Clock className="w-4 h-4" />,
      badge: preorderCount,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-6 bg-white border-r border-[#E8E0D7] text-[#29231F]">
      <div className="space-y-8">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl tracking-[0.16em] font-medium text-[#29231F]">
              K&M beauty
            </h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#765343] font-semibold block">
              Espace Gestion
            </span>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#8C8178] hover:text-[#29231F]"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (mobileOpen) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#29231F] text-[#FAF8F4]'
                    : 'text-[#8C8178] hover:text-[#29231F] hover:bg-[#F1ECE5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#C5A783]' : 'text-current'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#765343] text-white' : 'bg-[#E8E0D7] text-[#29231F]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-[#E8E0D7] space-y-2">
        <button
          onClick={onGoToShop}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#29231F] hover:text-[#765343] hover:bg-[#F1ECE5] transition-colors rounded-xs cursor-pointer font-medium"
        >
          <ExternalLink className="w-4 h-4 text-[#765343]" />
          <span>Voir la boutique</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors rounded-xs cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
