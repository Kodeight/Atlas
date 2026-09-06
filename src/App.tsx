import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { applyPageMeta, getPageTitle } from './pageMeta';
import { getProductBySlug, isCatalogStale } from './data/products';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ShippingPage } from './pages/ShippingPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
import { FaqPage } from './pages/FaqPage';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { OrderNowModal } from './components/OrderNowModal';
import { SearchModal } from './components/SearchModal';
import { Toast } from './components/Toast';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

const MainRouter: React.FC = () => {
  const { currentPath, language, products, refreshProducts } = useShop();

  // Scroll to top + keep the browser tab title (and product meta) in sync.
  // Re-runs when products load so async product data updates the title.
  // /admin* titles are owned by AdminPage (tab-aware) — getPageTitle returns null there.
  // Staleness-based revalidation: navigating to a product surface with data older
  // than 60s refetches from the database, so Admin edits appear without a hard refresh.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const isProductSurface =
      currentPath === '/' ||
      currentPath === '/shop' ||
      currentPath.startsWith('/category/') ||
      currentPath.startsWith('/product/');
    if (isProductSurface && isCatalogStale(60_000)) {
      refreshProducts();
    }
    const title = getPageTitle(currentPath, language, (slug) => getProductBySlug(slug));
    let description: string | undefined;
    if (title !== null && currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').split('?')[0];
      description = slug ? getProductBySlug(slug)?.shortDescription : undefined;
    }
    applyPageMeta(title, description);
    // Note: refreshProducts intentionally omitted from deps — its identity only
    // changes with language, which already retriggers this effect.
  }, [currentPath, language, products]);

  // Route matching
  if (currentPath === '/' || currentPath === '') {
    return <HomePage />;
  }

  if (currentPath === '/shop') {
    return <ShopPage initialCategory="all" />;
  }

  if (currentPath.startsWith('/category/')) {
    return <ShopPage />;
  }

  if (currentPath.startsWith('/product/')) {
    const slug = currentPath.replace('/product/', '');
    return <ProductDetailPage slug={slug} />;
  }

  if (currentPath === '/cart') {
    return <CartPage />;
  }

  if (currentPath.startsWith('/order-confirmation/')) {
    const orderId = currentPath.replace('/order-confirmation/', '');
    return <OrderConfirmationPage orderIdParam={orderId} />;
  }

  if (currentPath === '/about') {
    return <AboutPage />;
  }

  if (currentPath === '/contact') {
    return <ContactPage />;
  }

  if (currentPath === '/shipping') {
    return <ShippingPage />;
  }

  if (currentPath === '/size-guide') {
    return <SizeGuidePage />;
  }

  if (currentPath === '/faq') {
    return <FaqPage />;
  }

  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return <AdminPage />;
  }

  // Fallback to 404
  return <NotFoundPage />;
};

const AppContent: React.FC = () => {
  const { currentPath } = useShop();
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');
  const isLoginRoute = currentPath === '/login';
  const hideChrome = isAdminRoute || isLoginRoute;

  if (hideChrome) {
    return (
      <main className="grow">
        <MainRouter />
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="grow">
        <MainRouter />
      </main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <OrderNowModal />
      <SearchModal />
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#151515] selection:bg-[#1F5742] selection:text-white">
        <AppContent />
      </div>
    </ShopProvider>
  );
}