import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AtlasLogo } from './BrandElements';
import { useShop } from '../context/ShopContext';

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen, setIsSearchOpen, navigate, currentPath, language, setLanguage, t } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navShop'), path: '/shop' },
    { label: t('navWomen'), path: '/category/women' },
    { label: t('navMen'), path: '/category/men' },
    { label: t('navSale'), path: '/category/sale', isSale: true },
    { label: t('navAbout'), path: '/about' },
    { label: t('navContact'), path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <>
      {/* Top Algerian Delivery Trust Micro-Bar (NO COD MENTION) */}
      <div className="bg-[#164030] text-[#E7E3DA] text-[11px] sm:text-xs font-sans-ui tracking-wide py-1.5 px-4 text-center border-b border-[#286d53]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A3B899] shrink-0" />
            <span className="truncate">{t('topAnnouncement')}</span>
          </div>

          <div className="hidden md:inline-block text-[#A3B899]">•</div>

          <span className="hidden md:inline-block text-white/80">
            {t('freeShippingThresholdNote')}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-[#1F5742] text-white ${
          isScrolled
            ? 'py-3 sm:py-3.5 shadow-md border-b border-[#286d53]/40'
            : 'py-4 sm:py-5 border-b border-[#286d53]/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Toggle & Official Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/40"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center focus:outline-none group text-left"
              aria-label="Atlas Home"
            >
              <AtlasLogo className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:opacity-95" />
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-[12px] xl:text-[13px] font-sans-ui tracking-[0.14em] font-medium text-white/90">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleNavClick(link.path)}
                  className={`relative py-1.5 transition-colors duration-150 uppercase hover:text-white ${
                    isActive ? 'text-white font-semibold' : 'text-white/80'
                  } ${link.isSale ? 'text-[#E8A598] hover:text-[#f3beb5]' : ''}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E7E3DA] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Language Selector, Search & Shopping Bag */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Pill */}
            <div className="flex items-center bg-[#164030] rounded-full p-0.5 border border-[#286d53]/50 text-[11px] font-semibold font-sans-ui">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'fr'
                    ? 'bg-[#F7F3EA] text-[#1F5742] shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-[#F7F3EA] text-[#1F5742] shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-label="English"
              >
                EN
              </button>
            </div>

            {/* Search */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Bag */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 bg-[#F7F3EA] text-[#1F5742] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-4/5 max-w-sm bg-[#1F5742] text-white h-full flex flex-col shadow-2xl z-10 p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/15">
                <AtlasLogo className="h-7 w-auto" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Language Selector inside Drawer */}
              <div className="py-4 border-b border-white/15 flex items-center justify-between">
                <span className="text-xs text-white/80 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#A3B899]" />
                  <span>Langue / Language:</span>
                </span>
                <div className="flex items-center bg-[#164030] rounded-full p-0.5 border border-white/20 text-xs">
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`px-3 py-1 rounded-full ${
                      language === 'fr' ? 'bg-[#F7F3EA] text-[#1F5742] font-bold' : 'text-white/70'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full ${
                      language === 'en' ? 'bg-[#F7F3EA] text-[#1F5742] font-bold' : 'text-white/70'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Links List */}
              <nav className="flex flex-col py-6 space-y-4 text-sm font-sans-ui tracking-[0.15em]">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => handleNavClick(link.path)}
                    className={`flex items-center justify-between py-2 text-left uppercase transition-colors ${
                      currentPath === link.path
                        ? 'text-white font-semibold'
                        : 'text-white/80 hover:text-white'
                    } ${link.isSale ? 'text-[#E8A598]' : ''}`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}

                <div className="pt-4 border-t border-white/15 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleNavClick('/shipping')}
                    className="block text-left text-xs uppercase tracking-wider text-white/70 hover:text-white py-1"
                  >
                    {t('navShipping')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/size-guide')}
                    className="block text-left text-xs uppercase tracking-wider text-white/70 hover:text-white py-1"
                  >
                    {t('navSizeGuide')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/faq')}
                    className="block text-left text-xs uppercase tracking-wider text-white/70 hover:text-white py-1"
                  >
                    {t('navFaq')}
                  </button>
                </div>
              </nav>

              {/* Bottom info (NO COD MENTION!) */}
              <div className="mt-auto pt-6 border-t border-white/15 text-xs text-white/70 space-y-2">
                <div className="flex items-center gap-2 text-[#E7E3DA]">
                  <ShieldCheck className="w-4 h-4 text-[#A3B899]" />
                  <span className="font-medium">{t('heroNoCardBadge')}</span>
                </div>
                <p className="text-[11px] text-white/60">
                  {language === 'fr'
                    ? 'Payez à l’arrivée de votre commande. Commandes confirmées par téléphone.'
                    : 'Pay when your order arrives. Orders confirmed by telephone.'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
