/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ConfirmationView } from './components/ConfirmationView';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { db, subscribeToDatabase } from './services/db';
import { Order, Preorder, Product, SellerConfig } from './types';

export default function App() {
  // Navigation route: check initial path or hash for '/admin'
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin'
      );
    }
    return false;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    db.isAuthenticated()
  );

  // Live state from db
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [sellerConfig, setSellerConfig] = useState<SellerConfig>(() => db.getConfig());

  // Subscribe to DB updates for real-time synchronization between Admin and Storefront
  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      setProducts(db.getProducts());
      setSellerConfig(db.getConfig());
      setIsAuthenticated(db.isAuthenticated());
    });
    return unsubscribe;
  }, []);

  // Listen to browser URL changes
  useEffect(() => {
    const handlePopState = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin';
      setIsAdminView(isAdm);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Public storefront filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStockFilter, setActiveStockFilter] = useState<'all' | 'in_stock' | 'preorder'>('all');

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [confirmedState, setConfirmedState] = useState<{
    record: Order | Preorder;
    type: 'commande' | 'precommande';
  } | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);

  const scrollToCatalog = () => {
    setConfirmedState(null);
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setIsAdminView(true);
    try {
      window.history.pushState(null, '', '/admin');
    } catch {
      window.location.hash = '#admin';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToShop = () => {
    setIsAdminView(false);
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) {
      return false;
    }

    if (activeStockFilter === 'in_stock') {
      if (p.stockQuantity <= 0) return false;
    } else if (activeStockFilter === 'preorder') {
      if (p.stockQuantity > 0) return false;
    }

    return true;
  });

  // If on admin route:
  if (isAdminView) {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAuthenticated(true)}
          onBackToShop={navigateToShop}
        />
      );
    }

    return (
      <AdminDashboard
        onGoToShop={navigateToShop}
        onLogout={() => {
          db.logout();
          setIsAuthenticated(false);
        }}
      />
    );
  }

  // Otherwise, render Public Storefront:
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#29231F] selection:bg-[#765343]/15">
      {/* Header */}
      <Header
        sellerConfig={sellerConfig}
        onOpenAdmin={navigateToAdmin}
        onScrollToCatalog={scrollToCatalog}
      />

      {/* Main Content */}
      <main className="flex-1">
        {confirmedState ? (
          <ConfirmationView
            record={confirmedState.record}
            type={confirmedState.type}
            onBackToShop={() => {
              setConfirmedState(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {/* Minimalist Hero */}
            <Hero onDiscoverClick={scrollToCatalog} />

            {/* Catalog Section: Core focal point */}
            <section
              id="catalogue"
              ref={catalogRef}
              className="py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 scroll-mt-16"
            >
              {/* Category & Availability Filters */}
              <div className="pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E0D7]">
                {/* Category filters */}
              

                {/* Stock filter */}
                <div className="flex items-center gap-1.5 self-start md:self-auto text-xs bg-[#F1ECE5] p-1 border border-[#E8E0D7]">
                  <button
                    onClick={() => setActiveStockFilter('all')}
                    className={`px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      activeStockFilter === 'all'
                        ? 'bg-white text-[#29231F] shadow-2xs'
                        : 'text-[#8C8178] hover:text-[#29231F]'
                    }`}
                  >
                    Tous ({products.length})
                  </button>
                  <button
                    onClick={() => setActiveStockFilter('in_stock')}
                    className={`px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      activeStockFilter === 'in_stock'
                        ? 'bg-white text-[#29231F] shadow-2xs'
                        : 'text-[#8C8178] hover:text-[#29231F]'
                    }`}
                  >
                    En stock
                  </button>
                  <button
                    onClick={() => setActiveStockFilter('preorder')}
                    className={`px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      activeStockFilter === 'preorder'
                        ? 'bg-white text-red-700 shadow-2xs font-semibold'
                        : 'text-[#8C8178] hover:text-[#29231F]'
                    }`}
                  >
                    Épuisés (Précommandes)
                  </button>
                </div>
              </div>

              {/* Responsive Products Grid (Each color is an independent product!) */}
              <div className="pt-8 grid grid-cols-2 gap-6 sm:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setDetailProduct(p)}
                    onOrderClick={(p) => setCheckoutProduct(p)}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-[#F1ECE5]/40 border border-[#E8E0D7] p-6 mt-6">
                  <p className="font-serif text-lg text-[#29231F]">
                    Aucun sac ne correspond à ce filtre
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setActiveStockFilter('all');
                    }}
                    className="mt-3 px-4 py-2 text-xs uppercase tracking-wider bg-[#29231F] text-white cursor-pointer"
                  >
                    Afficher tous les sacs
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Discreet Footer */}
      <Footer
        sellerConfig={sellerConfig}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Product Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOrder={(prod) => {
            setDetailProduct(null);
            setCheckoutProduct(prod);
          }}
        />
      )}

      {/* Frictionless 3-Field Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onComplete={(record, type) => {
            setCheckoutProduct(null);
            setConfirmedState({ record, type });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
