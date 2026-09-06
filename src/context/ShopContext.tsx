import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, detectBrowserLanguage } from '../i18n/translations';
import { fetchProductsFromCMS, hasFetchedFromCMS, mapAdminProductsToStorefront, getAllAtlasProductsFallback, setCachedProducts, wasFallbackUsed } from '../data/products';
import { Product, CartItem, ProductColor } from '../types';

interface OrderNowParams {
  product?: Product;
  size?: string;
  color?: ProductColor;
  quantity?: number;
  isFromCart?: boolean;
}

interface ShopContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  orderNowModal: {
    isOpen: boolean;
    product?: Product;
    size?: string;
    color?: ProductColor;
    quantity: number;
    isFromCart: boolean;
  };
  openOrderNow: (params?: OrderNowParams) => void;
  closeOrderNow: () => void;

  quickViewProduct?: Product;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  toast: { text: string; visible: boolean };
  showToast: (text: string) => void;

  currentPath: string;
  navigate: (path: string) => void;

  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;

  // Product state - fetched from CMS or static fallback
  products: Product[];
  setProducts: (prods: Product[]) => void;
  refreshProducts: () => Promise<void>;
  isProductsLoading: boolean;
  error: string | null;
  codEnabled: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'atlas_shopping_bag_v1';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => detectBrowserLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('atlas_lang', lang);
    } catch {
      // storage unavailable
    }
  };

  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || '';
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | undefined>(undefined);
  const [toast, setToast] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });

  const [orderNowModal, setOrderNowModal] = useState<{
    isOpen: boolean;
    product?: Product;
    size?: string;
    color?: ProductColor;
    quantity: number;
    isFromCart: boolean;
  }>({
    isOpen: false,
    quantity: 1,
    isFromCart: false,
  });

  // Product state - fetched from CMS or static fallback
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store settings (COD toggle enforced at checkout; fail-open preserves current behavior)
  const [codEnabled, setCodEnabled] = useState(true);
  useEffect(() => {
    fetch('/admin/api/settings', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.codEnabled === 'boolean') setCodEnabled(data.codEnabled);
      })
      .catch(() => {});
  }, []);

  // Revalidatable CMS product load. The database is the single source of truth;
  // the static catalog is only a fallback, and its use is surfaced to the user.
  const refreshInFlight = useRef(false);
  const productsRef = useRef<Product[]>([]);
  productsRef.current = products;

  const refreshProducts = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setIsProductsLoading(true);
    setError(null);
    try {
      const cmsProducts = await fetchProductsFromCMS(language === 'fr' ? 'fr' : 'en');
      setProducts(cmsProducts);
      setCachedProducts(cmsProducts);
      if (wasFallbackUsed() && productsRef.current.length === 0) {
        showToast(t('catalogOffline'));
      }
    } catch (err) {
      console.error('Failed to load products from CMS:', err);
      setError('Failed to load products. Using available data.');
      const fallback = getAllAtlasProductsFallback();
      setProducts(fallback);
      setCachedProducts(fallback);
      if (productsRef.current.length === 0) showToast(t('catalogOffline'));
    } finally {
      setIsProductsLoading(false);
      refreshInFlight.current = false;
    }
    // Note: showToast/t intentionally omitted from deps — both are stable for a
    // given language, which already retriggers this callback.
  }, [language]);

  // Fetch products from CMS when component mounts or the language changes
  // (product names/descriptions/tags are stored in both English and French)
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Helper to get products - use CMS data if available, otherwise static fallback
  const getProducts = (): Product[] => {
    if (products.length > 0) {
      return products;
    }
    return getAllAtlasProductsFallback();
  };

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Current path tracking
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage error
    }
  }, [cart]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (text: string) => {
    setToast({ text, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  const addToCart = (product: Product, size: string, color: ProductColor, quantity = 1) => {
    const itemId = `${product.id}_${size}_${color.name}`;
    const unitPrice = product.salePrice ?? product.price;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prevCart,
        {
          id: itemId,
          productId: product.id,
          product,
          size,
          color,
          quantity,
          unitPrice,
        },
      ];
    });

    showToast(`Added "${product.name}" (${size}) to your bag`);
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from bag');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const openOrderNow = (params?: OrderNowParams) => {
    setOrderNowModal({
      isOpen: true,
      product: params?.product,
      size: params?.size,
      color: params?.color,
      quantity: params?.quantity || 1,
      isFromCart: !!params?.isFromCart,
    });
    setIsCartOpen(false);
  };

  const closeOrderNow = () => {
    setOrderNowModal((prev) => ({ ...prev, isOpen: false }));
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(undefined);
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        orderNowModal,
        openOrderNow,
        closeOrderNow,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        toast,
        showToast,
        currentPath,
        navigate,
        language,
        setLanguage,
        t,
        products: getProducts(),
        setProducts,
        refreshProducts,
        isProductsLoading,
        error,
        codEnabled,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};