import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { Product, Order, Preorder, SellerConfig, OrderStatus, PreorderStatus } from '../types';
import { firestore, handleFirestoreError, OperationType } from './firebase';

const STORAGE_KEYS = {
  PRODUCTS: 'kmbeauty_products_v2',
  ORDERS: 'kmbeauty_orders_v2',
  PREORDERS: 'kmbeauty_preorders_v2',
  CONFIG: 'kmbeauty_config_v2',
  AUTH: 'kmbeauty_admin_auth_v2',
  SEEDED: 'kmbeauty_init_seeded_v2',
};

export const DEFAULT_CONFIG: SellerConfig = {
  shopName: 'K&M beauty',
  whatsappPhone: '2250140586280',
  displayPhone: '+225 01 40 58 62 80',
  city: 'Abidjan',
  country: "Côte d'Ivoire",
  currency: 'FCFA',
  adminEmail: 'admin@kmbeauty.com',
};

// ONLY 1 single bag as strictly requested by the user
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-classique-camel',
    name: 'Sac Classique Trapèze',
    color: 'Camel Fauve',
    price: 24000,
    stockQuantity: 10,
    accessories: ['Bandoulière cuir réglable', 'Fermoir bijou doré', 'Pochon de protection'],
    imageUrl: '/src/assets/images/bag_camel_curved_tote_1794136129180.jpg',
    category: 'porte-main',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  },
];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_PREORDERS: Preorder[] = [];

// Old dummy IDs to clean up from Firestore & LocalStorage
const OLD_DUMMY_IDS = [
  'prod-classique-noir',
  'prod-demi-lune-craie',
  'prod-demi-lune-sauge',
  'prod-cabas-terracotta',
  'prod-pochette-bordeaux',
  'prod-pochette-noir',
  'prod-noeud-sauge',
  'solene-numero-sept',
  'solene-ecrin-gourmette',
  'solene-demi-lune',
  'solene-noeud-signature',
  'solene-grand-cabas-riviera',
  'solene-pochette-gourmette',
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToDatabase(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifySubscribers() {
  listeners.forEach((fn) => fn());
}

// In-memory cache synced with Firestore & LocalStorage
let cachedProducts: Product[] = [];
let cachedOrders: Order[] = [];
let cachedPreorders: Preorder[] = [];
let cachedConfig: SellerConfig = DEFAULT_CONFIG;
let isFirestoreInitialized = false;

// Cleanup old mock items from Firestore
async function purgeOldMockData() {
  for (const id of OLD_DUMMY_IDS) {
    try {
      await deleteDoc(doc(firestore, 'products', id));
    } catch {
      // Ignore if doesn't exist
    }
  }
}

// Initialize listeners with Firestore
export function initFirestoreSync() {
  if (isFirestoreInitialized) return;
  isFirestoreInitialized = true;

  // Run cleanup once
  purgeOldMockData().catch(() => {});

  // 1. Sync Products
  const productsCol = collection(firestore, 'products');
  onSnapshot(
    productsCol,
    (snapshot) => {
      const alreadySeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);

      if (!snapshot.empty) {
        const loaded: Product[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as Product;
          // Filter out any lingering old mock products
          if (!OLD_DUMMY_IDS.includes(item.id)) {
            loaded.push(item);
          }
        });

        // If after filtering we have items, use them
        if (loaded.length > 0) {
          cachedProducts = loaded;
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(loaded));
          notifySubscribers();
          return;
        }
      }

      // If never seeded before, seed only the 1 single initial bag
      if (!alreadySeeded) {
        localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
        INITIAL_PRODUCTS.forEach((p) => {
          setDoc(doc(firestore, 'products', p.id), p).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `products/${p.id}`)
          );
        });
        cachedProducts = INITIAL_PRODUCTS;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        notifySubscribers();
      } else {
        // User intentionally deleted all products or has their own
        cachedProducts = [];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
        notifySubscribers();
      }
    },
    (error) => {
      console.warn('Firestore products onSnapshot offline, fallback to local', error);
    }
  );

  // 2. Sync Orders
  const ordersCol = collection(firestore, 'orders');
  onSnapshot(
    ordersCol,
    (snapshot) => {
      const loaded: Order[] = [];
      snapshot.forEach((d) => {
        loaded.push(d.data() as Order);
      });
      cachedOrders = loaded;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(loaded));
      notifySubscribers();
    },
    (error) => {
      console.warn('Firestore orders onSnapshot offline', error);
    }
  );

  // 3. Sync Preorders
  const preordersCol = collection(firestore, 'preorders');
  onSnapshot(
    preordersCol,
    (snapshot) => {
      const loaded: Preorder[] = [];
      snapshot.forEach((d) => {
        loaded.push(d.data() as Preorder);
      });
      cachedPreorders = loaded;
      localStorage.setItem(STORAGE_KEYS.PREORDERS, JSON.stringify(loaded));
      notifySubscribers();
    },
    (error) => {
      console.warn('Firestore preorders onSnapshot offline', error);
    }
  );

  // 4. Sync Settings
  const settingsDocRef = doc(firestore, 'settings', 'general');
  onSnapshot(
    settingsDocRef,
    (snap) => {
      if (snap.exists()) {
        cachedConfig = snap.data() as SellerConfig;
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cachedConfig));
        notifySubscribers();
      } else {
        setDoc(settingsDocRef, DEFAULT_CONFIG).catch((err) =>
          handleFirestoreError(err, OperationType.WRITE, 'settings/general')
        );
      }
    },
    (error) => {
      console.warn('Firestore settings onSnapshot offline', error);
    }
  );
}

// Start Firestore Sync immediately
initFirestoreSync();

export const db = {
  // PRODUCTS
  getProducts(): Product[] {
    if (cachedProducts.length > 0) return cachedProducts;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        const parsed = JSON.parse(data) as Product[];
        const filtered = parsed.filter((p) => !OLD_DUMMY_IDS.includes(p.id));
        cachedProducts = filtered;
        return cachedProducts;
      }
    } catch (e) {
      console.error(e);
    }
    cachedProducts = INITIAL_PRODUCTS;
    return cachedProducts;
  },

  getProduct(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };

    // Update in-memory and local
    cachedProducts = [newProduct, ...this.getProducts()];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cachedProducts));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'products', newProduct.id);
    setDoc(docRef, newProduct).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `products/${newProduct.id}`)
    );

    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Produit introuvable');

    const updated: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    cachedProducts = [...products];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cachedProducts));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'products', id);
    updateDoc(docRef, updates as any).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`)
    );

    return updated;
  },

  updateStock(id: string, newStock: number): Product {
    const safeStock = Math.max(0, Number(newStock) || 0);
    return this.updateProduct(id, { stockQuantity: safeStock });
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);

    // Update immediately in cache & storage
    cachedProducts = filtered;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cachedProducts));
    notifySubscribers();

    // Delete from Firestore
    const docRef = doc(firestore, 'products', id);
    deleteDoc(docRef).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`)
    );

    return true;
  },

  duplicateProduct(id: string, newColorName?: string): Product {
    const original = this.getProduct(id);
    if (!original) throw new Error('Produit introuvable');

    const color = newColorName ? newColorName.trim() : `${original.color} (Copie)`;
    return this.createProduct({
      name: original.name,
      color,
      price: original.price,
      stockQuantity: 10,
      accessories: [...original.accessories],
      imageUrl: original.imageUrl,
      additionalImages: original.additionalImages ? [...original.additionalImages] : [],
      category: original.category,
    });
  },

  // ORDERS
  getOrders(): Order[] {
    if (cachedOrders.length > 0) return cachedOrders;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) {
        cachedOrders = JSON.parse(data);
        return cachedOrders;
      }
    } catch (e) {
      console.error(e);
    }
    cachedOrders = [];
    return cachedOrders;
  },

  createOrder(data: {
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    product: Product;
    quantity?: number;
    whatsappMessage?: string;
    whatsappUrl?: string;
  }): Order {
    const now = new Date().toISOString();
    const qty = data.quantity || 1;

    // AUTOMATIC STOCK DEDUCTION ON ORDER:
    // When a customer orders, the stock is immediately decremented.
    // If it was the last bag, stock becomes 0 and triggers 'ÉPUISÉ' automatically.
    const currentProduct = this.getProduct(data.product.id);
    if (currentProduct) {
      const newStock = Math.max(0, currentProduct.stockQuantity - qty);
      this.updateStock(currentProduct.id, newStock);
    }

    const newOrder: Order = {
      id: `CMD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      customerFirstName: data.customerFirstName.trim(),
      customerLastName: data.customerLastName.trim(),
      customerPhone: data.customerPhone.trim(),
      productId: data.product.id,
      productNameSnapshot: data.product.name,
      productColorSnapshot: data.product.color,
      productImageSnapshot: data.product.imageUrl,
      quantity: qty,
      unitPrice: data.product.price,
      totalPrice: data.product.price * qty,
      status: 'en_attente',
      stockDeducted: true, // Automatically deducted right away!
      createdAt: now,
      updatedAt: now,
      whatsappMessage: data.whatsappMessage,
      whatsappUrl: data.whatsappUrl,
    };

    cachedOrders = [newOrder, ...this.getOrders()];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cachedOrders));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'orders', newOrder.id);
    setDoc(docRef, newOrder).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`)
    );

    return newOrder;
  },

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): { order: Order; error?: string } {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Commande introuvable');

    const order = orders[index];
    const product = this.getProduct(order.productId);

    // If order was deducted and is now CANCELLED, restore stock
    if (newStatus === 'annulee' && order.stockDeducted) {
      if (product) {
        this.updateStock(product.id, product.stockQuantity + order.quantity);
        order.stockDeducted = false;
      }
    }

    // If order was cancelled (not deducted) and is restored back, deduct again
    if (newStatus !== 'annulee' && !order.stockDeducted) {
      if (product) {
        if (product.stockQuantity < order.quantity) {
          return {
            order,
            error: `Stock insuffisant pour réactiver cette commande (disponible : ${product.stockQuantity}).`,
          };
        }
        this.updateStock(product.id, product.stockQuantity - order.quantity);
        order.stockDeducted = true;
      }
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    orders[index] = order;
    cachedOrders = [...orders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cachedOrders));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'orders', orderId);
    updateDoc(docRef, {
      status: newStatus,
      stockDeducted: order.stockDeducted,
      updatedAt: order.updatedAt,
    }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`)
    );

    return { order };
  },

  // PREORDERS
  getPreorders(): Preorder[] {
    if (cachedPreorders.length > 0) return cachedPreorders;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREORDERS);
      if (data) {
        cachedPreorders = JSON.parse(data);
        return cachedPreorders;
      }
    } catch (e) {
      console.error(e);
    }
    cachedPreorders = [];
    return cachedPreorders;
  },

  createPreorder(data: {
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    product: Product;
    quantity?: number;
    whatsappMessage?: string;
    whatsappUrl?: string;
  }): Preorder {
    const now = new Date().toISOString();
    const qty = data.quantity || 1;

    const newPreorder: Preorder = {
      id: `PRE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      customerFirstName: data.customerFirstName.trim(),
      customerLastName: data.customerLastName.trim(),
      customerPhone: data.customerPhone.trim(),
      productId: data.product.id,
      productNameSnapshot: data.product.name,
      productColorSnapshot: data.product.color,
      productImageSnapshot: data.product.imageUrl,
      quantity: qty,
      unitPrice: data.product.price,
      status: 'nouvelle',
      createdAt: now,
      updatedAt: now,
      whatsappMessage: data.whatsappMessage,
      whatsappUrl: data.whatsappUrl,
    };

    cachedPreorders = [newPreorder, ...this.getPreorders()];
    localStorage.setItem(STORAGE_KEYS.PREORDERS, JSON.stringify(cachedPreorders));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'preorders', newPreorder.id);
    setDoc(docRef, newPreorder).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `preorders/${newPreorder.id}`)
    );

    return newPreorder;
  },

  updatePreorderStatus(preorderId: string, newStatus: PreorderStatus): Preorder {
    const preorders = this.getPreorders();
    const index = preorders.findIndex((p) => p.id === preorderId);
    if (index === -1) throw new Error('Précommande introuvable');

    const preorder = preorders[index];
    preorder.status = newStatus;
    preorder.updatedAt = new Date().toISOString();
    preorders[index] = preorder;
    cachedPreorders = [...preorders];
    localStorage.setItem(STORAGE_KEYS.PREORDERS, JSON.stringify(cachedPreorders));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'preorders', preorderId);
    updateDoc(docRef, {
      status: newStatus,
      updatedAt: preorder.updatedAt,
    }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `preorders/${preorderId}`)
    );

    return preorder;
  },

  // CONFIG
  getConfig(): SellerConfig {
    if (cachedConfig && cachedConfig.shopName) return cachedConfig;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) {
        cachedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
        return cachedConfig;
      }
    } catch (e) {
      console.error(e);
    }
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  },

  updateConfig(updates: Partial<SellerConfig>): SellerConfig {
    const current = this.getConfig();
    const updated = { ...current, ...updates };
    cachedConfig = updated;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    notifySubscribers();

    // Persist to Firestore
    const docRef = doc(firestore, 'settings', 'general');
    setDoc(docRef, updated).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, 'settings/general')
    );

    return updated;
  },

  // AUTH
  isAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  login(password: string): boolean {
    if (password === 'admin' || password === 'kmbeauty') {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      notifySubscribers();
      return true;
    }
    return false;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    notifySubscribers();
  },

  // RESET TO DEMO DATA (Only 1 single bag)
  resetToDefaults(): void {
    cachedProducts = INITIAL_PRODUCTS;
    cachedOrders = [];
    cachedPreorders = [];
    cachedConfig = DEFAULT_CONFIG;

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PREORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    notifySubscribers();

    // Purge old docs in Firestore
    purgeOldMockData().catch(() => {});

    // Sync the single initial product
    INITIAL_PRODUCTS.forEach((p) => {
      setDoc(doc(firestore, 'products', p.id), p).catch(() => {});
    });
    setDoc(doc(firestore, 'settings', 'general'), DEFAULT_CONFIG).catch(() => {});
  },
};
