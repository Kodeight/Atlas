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
import AdminPage from './pages/AdminPage';

const MainRouter: React.FC = () => {
  const { currentPath } = useShop();

  // Scroll to top + keep the browser tab title in sync with the route
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      document.title = 'Atlas Admin — Dashboard';
    } else if (currentPath === '/login') {
      document.title = 'Atlas Admin — Login';
    } else {
      document.title = 'Atlas — Fashion & Clothing';
    }
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