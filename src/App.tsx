import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
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

const MainRouter: React.FC = () => {
  const { currentPath, isProductsLoading, error, products } = useShop();

  // Scroll to top on path change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

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

  // Fallback to 404
  return <NotFoundPage />;
};

export default function App() {
  return (
    <ShopProvider>
      <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#151515] selection:bg-[#1F5742] selection:text-white">
        {/* Persistent Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="grow">
          <MainRouter />
        </main>

        {/* Persistent Footer */}
        <Footer />

        {/* Global Overlays & Modals */}
        <CartDrawer />
        <QuickViewModal />
        <OrderNowModal />
        <SearchModal />
        <Toast />
      </div>
    </ShopProvider>
  );
}