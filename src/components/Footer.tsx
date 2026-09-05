import React, { useState } from 'react';
import { AtlasLogo, AtlasStarIcon } from './BrandElements';
import { ShieldCheck, Truck, PhoneCall, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { navigate, showToast, language, t } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast(language === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    showToast(language === 'fr' ? 'Merci pour votre inscription à la Maison Atlas.' : 'Thank you for subscribing to Atlas Fashion.');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#1F5742] text-white pt-16 pb-10 border-t border-[#286d53]/30">
      {/* Brand Value Pillars (NO COD MENTION) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded bg-[#164030] text-[#A3B899] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase font-sans-ui text-white">
                {t('trustPillar1Title')}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {t('trustPillar1Desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded bg-[#164030] text-[#A3B899] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase font-sans-ui text-white">
                {t('trustPillar2Title')}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {t('trustPillar2Desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded bg-[#164030] text-[#A3B899] shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase font-sans-ui text-white">
                {t('trustPillar3Title')}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {t('trustPillar3Desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded bg-[#164030] text-[#A3B899] shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase font-sans-ui text-white">
                {language === 'fr' ? 'Essayage & Échange' : 'Fitting & Exchange'}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {language === 'fr'
                  ? 'Échange de taille facilité avec un accompagnement direct par notre service client algérois.'
                  : 'Size exchange supported with fast response through our Alger customer care desk.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <AtlasLogo className="h-8 sm:h-9 w-auto object-contain" />
            <p className="text-sm text-white/75 leading-relaxed max-w-sm font-sans-ui">
              {language === 'fr'
                ? 'Mode contemporaine algérienne alliant élégance éditoriale, matières naturelles et paiement en toute tranquillité à la livraison sur tout le territoire national.'
                : 'Contemporary Algerian fashion designed with editorial elegance. Curated silhouettes, natural textiles, and effortless payment upon arrival throughout the country.'}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#164030] text-[#E7E3DA]">
                <AtlasStarIcon className="w-3 h-3 text-[#A3B899]" />
                {language === 'fr' ? 'Algérie • 69 Wilayas' : 'Algeria • All 69 Wilayas'}
              </span>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E7E3DA] mb-4 font-sans-ui">
              {language === 'fr' ? 'COLLECTIONS' : 'COLLECTIONS'}
            </h3>
            <ul className="space-y-2.5 text-xs text-white/80 font-sans-ui">
              <li>
                <button type="button" onClick={() => navigate('/shop')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'fr' ? 'Tous les Vêtements' : 'All Products'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/category/women')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'fr' ? 'Collection Femmes' : 'Women’s Fashion'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/category/men')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'fr' ? 'Collection Hommes' : 'Men’s Collection'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/category/dresses')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'fr' ? 'Robes & Combinaisons' : 'Dresses & Jumpsuits'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/category/tops')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'fr' ? 'Hauts & Chemises Lin' : 'Tops & Linen Shirts'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/category/sale')} className="text-[#E8A598] hover:text-[#f3beb5] transition-colors font-medium cursor-pointer">
                  {t('theSaleEdit')}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E7E3DA] mb-4 font-sans-ui">
              {language === 'fr' ? 'SERVICE CLIENT' : 'CUSTOMER CARE'}
            </h3>
            <ul className="space-y-2.5 text-xs text-white/80 font-sans-ui">
              <li>
                <button type="button" onClick={() => navigate('/shipping')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navShipping')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/size-guide')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navSizeGuide')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/faq')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navFaq')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navContact')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navAbout')}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E7E3DA] mb-3 font-sans-ui">
              {language === 'fr' ? 'LE CERCLE ATLAS' : 'JOIN THE ATLAS LIST'}
            </h3>
            <p className="text-xs text-white/70 leading-relaxed mb-3">
              {language === 'fr'
                ? 'Soyez les premiers informés de nos nouvelles collections et de nos lancements exclusifs.'
                : 'Be the first to discover new seasonal arrivals and private member edits.'}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#A3B899] bg-[#164030] p-3 rounded">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'fr'
                    ? 'Vous êtes inscrit(e). Bienvenue chez Atlas.'
                    : 'You are subscribed. Welcome to Atlas.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={language === 'fr' ? 'Votre adresse email' : 'Enter your email'}
                    className="w-full bg-[#164030] text-white placeholder-white/50 text-xs px-3.5 py-2.5 rounded border border-white/20 focus:outline-none focus:border-white/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-[#F7F3EA] text-[#1F5742] hover:bg-white text-xs font-semibold rounded flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
        <div>
          &copy; {new Date().getFullYear()} ATLAS — {language === 'fr' ? 'Maison de Mode Algérienne' : 'Algerian Fashion House'}.
        </div>
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => navigate('/shipping')} className="hover:text-white transition-colors cursor-pointer">
            {language === 'fr' ? 'Conditions de Livraison' : 'Delivery Terms'}
          </button>
          <button type="button" onClick={() => navigate('/faq')} className="hover:text-white transition-colors cursor-pointer">
            {language === 'fr' ? 'Paiement à la Livraison' : 'Payment on Delivery'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="hover:text-white transition-colors cursor-pointer opacity-50 hover:opacity-100 text-[11px] tracking-wider">
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
};
