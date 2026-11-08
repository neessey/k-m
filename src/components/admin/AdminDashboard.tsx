import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminProductForm } from './AdminProductForm';
import { AdminOrders } from './AdminOrders';
import { AdminPreorders } from './AdminPreorders';
import { AdminSettings } from './AdminSettings';
import { Order, Preorder, Product, SellerConfig } from '../../types';
import { db, subscribeToDatabase } from '../../services/db';

interface AdminDashboardProps {
  onGoToShop: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onGoToShop,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Live state from db
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [preorders, setPreorders] = useState<Preorder[]>(() => db.getPreorders());
  const [sellerConfig, setSellerConfig] = useState<SellerConfig>(() => db.getConfig());

  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      setProducts(db.getProducts());
      setOrders(db.getOrders());
      setPreorders(db.getPreorders());
      setSellerConfig(db.getConfig());
    });
    return unsubscribe;
  }, []);

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setCurrentTab('add_product');
  };

  const handleStartAddProduct = () => {
    setEditingProduct(null);
    setCurrentTab('add_product');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col lg:flex-row text-[#29231F]">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-[#E8E0D7] p-4 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-[#29231F] hover:bg-[#F1ECE5] rounded-xs cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-serif text-lg font-medium tracking-[0.16em]">
          K&M beauty
        </span>

        <button
          onClick={onGoToShop}
          className="text-xs text-[#765343] font-medium hover:underline cursor-pointer"
        >
          Boutique
        </button>
      </div>

      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'add_product') {
            setEditingProduct(null);
          }
          setCurrentTab(tab);
        }}
        onLogout={onLogout}
        onGoToShop={onGoToShop}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        orderCount={orders.filter((o) => o.status === 'en_attente').length}
        preorderCount={preorders.filter((p) => p.status === 'nouvelle').length}
      />

      {/* Main Content Pane */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {currentTab === 'overview' && (
          <AdminOverview
            products={products}
            orders={orders}
            preorders={preorders}
            onNavigate={(tab) => {
              if (tab === 'add_product') setEditingProduct(null);
              setCurrentTab(tab);
            }}
            onEditProduct={handleEditProduct}
          />
        )}

        {currentTab === 'products' && (
          <AdminProducts
            products={products}
            onAddProduct={handleStartAddProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {currentTab === 'add_product' && (
          <AdminProductForm
            initialProduct={editingProduct}
            onCancel={() => {
              setEditingProduct(null);
              setCurrentTab('products');
            }}
            onSaved={() => {
              setEditingProduct(null);
              setCurrentTab('products');
            }}
          />
        )}

        {currentTab === 'orders' && <AdminOrders orders={orders} />}

        {currentTab === 'preorders' && <AdminPreorders preorders={preorders} />}

        {currentTab === 'settings' && (
          <AdminSettings
            config={sellerConfig}
            onConfigUpdated={(cfg) => setSellerConfig(cfg)}
          />
        )}
      </main>
    </div>
  );
};
