import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { AtlasStarIcon, AtlasFloralMotif } from '../components/BrandElements';
import { AnimatedReveal } from '../components/AnimatedReveal';
import {
  getNewArrivals,
  getFeaturedProducts,
  getSaleProducts,
  getBestSellers,
} from '../data/products';
import { FASHION_EDITORIAL_IMAGES } from '../services/imageService';
import { ArrowRight, ShieldCheck, Truck, PhoneCall, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate, language, t } = useShop();

  const newArrivals = getNewArrivals().slice(0, 4);
  const featuredProducts = getFeaturedProducts().slice(0, 4);
  const saleProducts = getSaleProducts().slice(0, 4);
  const bestSellers = getBestSellers().slice(0, 4);

  return (
    <div className="flex flex-col bg-[#FCFBF7] overflow-x-hidden">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative w-full bg-[#F7F3EA] overflow-hidden border-b border-[#E7E3DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Large Editorial Model Image with clip-curtain reveal */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <AnimatedReveal animation="clip-curtain" delay={0.15}>
                <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-w-md mx-auto rounded-xs overflow-hidden shadow-2xl border-4 border-white group">
                  <img
                    src={FASHION_EDITORIAL_IMAGES.heroModel}
                    alt="Atlas Fashion Model"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-sans-ui text-[#E7E3DA] block">
                      {language === 'fr' ? 'Campagne Saisonnière' : 'Seasonal Campaign'}
                    </span>
                    <span className="text-base font-editorial font-normal">
                      {language === 'fr' ? 'Collection Été 2026' : 'Summer Collection 2026'}
                    </span>
                  </div>
                </div>
              </AnimatedReveal>

              {/* Decorative Geometric Floating Element with scale-spring */}
              <AnimatedReveal animation="scale-spring" delay={0.4} className="absolute -bottom-6 -right-6 hidden sm:block">
                <div className="p-4 bg-[#1F5742] text-white rounded-xs shadow-lg border border-white/20">
                  <div className="flex items-center gap-2">
                    <AtlasStarIcon className="w-4 h-4 text-[#A3B899]" />
                    <span className="text-xs font-semibold tracking-wider uppercase font-sans-ui">
                      {language === 'fr'
                        ? 'Paiement à la livraison • 69 Wilayas'
                        : 'Payment on Delivery • 69 Wilayas'}
                    </span>
                  </div>
                </div>
              </AnimatedReveal>
            </div>

            {/* Center / Right: Big Editorial 'FASHION' Headline & Brand Story */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 order-1 lg:order-2">
              <AnimatedReveal animation="blur-reveal" delay={0.1}>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui">
                  <AtlasStarIcon className="w-3.5 h-3.5" />
                  <span>{t('heroSubhead')}</span>
                </div>
              </AnimatedReveal>

              {/* Giant Serif 'FASHION' Headline */}
              <AnimatedReveal animation="soft-rise" delay={0.2} className="relative">
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-editorial font-normal text-[#1F5742] tracking-tight leading-[0.9]">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-editorial italic text-[#151515] mt-2 sm:mt-3">
                  {t('heroTagline')}
                </p>
              </AnimatedReveal>

              <AnimatedReveal animation="blur-reveal" delay={0.3}>
                <p className="text-sm sm:text-base text-[#6D6D6D] max-w-xl leading-relaxed font-sans-ui">
                  {t('heroDescription')}
                </p>
              </AnimatedReveal>

              {/* Call to Actions */}
              <AnimatedReveal animation="soft-rise" delay={0.35}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 relative z-10">
                  <button
                    id="hero-shop-collection-btn"
                    type="button"
                    onClick={() => navigate('/shop')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-xs transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md active:scale-97 cursor-pointer"
                  >
                    <span>
                      {t('heroShopButton') ||
                        (language === 'fr' ? 'DÉCOUVRIR LA COLLECTION' : 'SHOP THE COLLECTION')}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  <button
                    id="hero-new-arrivals-btn"
                    type="button"
                    onClick={() => navigate('/category/new-arrivals')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#1F5742] hover:text-white hover:border-[#1F5742] text-[#151515] border border-[#E7E3DA] text-xs font-semibold tracking-[0.18em] uppercase rounded-xs transition-all duration-200 active:scale-97 cursor-pointer text-center flex items-center justify-center"
                  >
                    <span>
                      {t('heroNewArrivals') ||
                        (language === 'fr' ? 'NOUVELLE COLLECTION' : 'NEW ARRIVALS')}
                    </span>
                  </button>
                </div>
              </AnimatedReveal>

              {/* Payment on Delivery Micro Banner (NO COD MENTION) */}
              <AnimatedReveal animation="blur-reveal" delay={0.45}>
                <div className="pt-4 border-t border-[#E7E3DA] flex flex-wrap items-center gap-6 text-xs text-[#6D6D6D] font-sans-ui">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1F5742]" />
                    <span>{t('heroPaymentBadge')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#1F5742]" />
                    <span>{t('heroDeliveryBadge')}</span>
                  </div>
                </div>
              </AnimatedReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEW COLLECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <AnimatedReveal animation="slide-left" delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E7E3DA]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#1F5742] font-sans-ui">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'fr' ? 'NOUVEAUTÉS' : 'JUST RELEASED'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal text-[#151515] mt-1">
                {t('newCollectionTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6D6D] mt-1 font-sans-ui">
                {t('newCollectionSubtitle')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/category/new-arrivals')}
              className="mt-4 sm:mt-0 text-xs font-semibold tracking-[0.15em] uppercase text-[#1F5742] hover:text-[#164030] flex items-center gap-1 transition-colors self-start sm:self-auto font-sans-ui cursor-pointer"
            >
              <span>{t('viewAllNew')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </AnimatedReveal>

        {/* 4-column desktop grid with multi-level staggered reveals */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {newArrivals.map((product, idx) => (
            <AnimatedReveal
              key={product.id}
              animation={idx % 2 === 0 ? 'soft-rise' : 'scale-spring'}
              delay={0.1 + idx * 0.1}
            >
              <ProductCard product={product} />
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* 3. EDITORIAL FASHION FEATURE (Asymmetric Editorial Section with clip-curtain) */}
      <section className="w-full bg-[#1F5742] text-white py-16 sm:py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left: Large Editorial Image */}
            <div className="lg:col-span-7 relative">
              <AnimatedReveal animation="clip-curtain" delay={0.1}>
                <div className="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full rounded-xs overflow-hidden shadow-2xl border-4 border-white/20">
                  <img
                    src={FASHION_EDITORIAL_IMAGES.editorialFeature1}
                    alt="The Atlas Edit"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </AnimatedReveal>
              <div className="absolute -top-4 -left-4 hidden sm:block">
                <AtlasFloralMotif className="w-16 h-16 text-white/30" />
              </div>
            </div>

            {/* Right: Editorial Typography & Statement with slide-right */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatedReveal animation="slide-right" delay={0.15}>
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#A3B899] block font-sans-ui">
                  {language === 'fr' ? 'MANIFESTE ÉDITORIAL' : 'EDITORIAL STATEMENT'}
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-normal leading-tight mt-2">
                  THE ATLAS EDIT
                </h2>

                <blockquote className="text-sm sm:text-base text-white/80 leading-relaxed font-sans-ui italic mt-4">
                  {language === 'fr'
                    ? '« La mode chez Atlas naît de la rencontre entre la lumière méditerranéenne, une élégance intemporelle et des matières nobles. Nous sélectionnons des toiles de lin et des coupes pensées pour le climat et le raffinement algérien. »'
                    : '“Fashion at Atlas is defined by the balance between Mediterranean light, relaxed elegance, and enduring quality. We select breathable fabrics that honor the climate and character of our country.”'}
                </blockquote>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans-ui mt-3">
                  {language === 'fr'
                    ? 'Des réunions de travail à Didouche Mourad aux douces soirées sur la corniche, nos pièces s’adaptent avec fluidité à chaque moment de votre journée.'
                    : 'From morning meetings in Didouche Mourad to festive evenings along the coastal corniche, our garments transition seamlessly between moments.'}
                </p>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/shop')}
                    className="px-7 py-3.5 bg-[#F7F3EA] hover:bg-white text-[#1F5742] text-xs font-semibold tracking-[0.18em] uppercase rounded-xs transition-transform active:scale-95 shadow-md cursor-pointer"
                  >
                    {language === 'fr' ? 'DÉCOUVRIR LA COLLECTION' : 'DISCOVER THE COLLECTION'}
                  </button>
                </div>
              </AnimatedReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOP BY CATEGORY (Visual Editorial Blocks) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <AnimatedReveal animation="blur-reveal" delay={0.1}>
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui">
              {language === 'fr' ? 'SÉLECTION PAR LIGNE' : 'CURATED SELECTION'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal text-[#151515]">
              {t('shopByCategoryTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6D6D]">
              {t('shopByCategorySubtitle')}
            </p>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category: Women */}
          <AnimatedReveal animation="scale-spring" delay={0.1}>
            <div
              onClick={() => navigate('/category/women')}
              className="group relative aspect-[3/4] overflow-hidden rounded-xs cursor-pointer shadow-md"
            >
              <img
                src={FASHION_EDITORIAL_IMAGES.categoryWomen}
                alt="Women's Collection"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-6 text-center text-white">
                <h3 className="text-xl font-editorial font-normal">
                  {language === 'fr' ? 'FEMMES' : 'WOMEN'}
                </h3>
                <p className="text-[11px] font-sans-ui text-white/80 uppercase tracking-widest mt-1">
                  {language === 'fr' ? 'Robes, Ensembles & Hauts' : 'Dresses, Tops & Sets'}
                </p>
                <span className="inline-block mt-3 text-[10px] uppercase font-semibold tracking-[0.15em] py-1 px-3 border border-white/40 rounded-xs group-hover:bg-white group-hover:text-[#151515] transition-colors">
                  {t('explore')}
                </span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Category: Men */}
          <AnimatedReveal animation="scale-spring" delay={0.2}>
            <div
              onClick={() => navigate('/category/men')}
              className="group relative aspect-[3/4] overflow-hidden rounded-xs cursor-pointer shadow-md"
            >
              <img
                src={FASHION_EDITORIAL_IMAGES.categoryMen}
                alt="Men's Collection"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-6 text-center text-white">
                <h3 className="text-xl font-editorial font-normal">
                  {language === 'fr' ? 'HOMMES' : 'MEN'}
                </h3>
                <p className="text-[11px] font-sans-ui text-white/80 uppercase tracking-widest mt-1">
                  {language === 'fr' ? 'Chemises Lin & Chinos' : 'Shirts, Chinos & Basics'}
                </p>
                <span className="inline-block mt-3 text-[10px] uppercase font-semibold tracking-[0.15em] py-1 px-3 border border-white/40 rounded-xs group-hover:bg-white group-hover:text-[#151515] transition-colors">
                  {t('explore')}
                </span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Category: New Arrivals */}
          <AnimatedReveal animation="scale-spring" delay={0.3}>
            <div
              onClick={() => navigate('/category/new-arrivals')}
              className="group relative aspect-[3/4] overflow-hidden rounded-xs cursor-pointer shadow-md"
            >
              <img
                src={FASHION_EDITORIAL_IMAGES.categoryNew}
                alt="New Arrivals"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-6 text-center text-white">
                <h3 className="text-xl font-editorial font-normal">
                  {language === 'fr' ? 'NOUVEAUTÉS' : 'NEW ARRIVALS'}
                </h3>
                <p className="text-[11px] font-sans-ui text-white/80 uppercase tracking-widest mt-1">
                  {language === 'fr' ? 'Nouvelle Vague' : 'Seasonal Releases'}
                </p>
                <span className="inline-block mt-3 text-[10px] uppercase font-semibold tracking-[0.15em] py-1 px-3 border border-white/40 rounded-xs group-hover:bg-white group-hover:text-[#151515] transition-colors">
                  {t('explore')}
                </span>
              </div>
            </div>
          </AnimatedReveal>

          {/* Category: Sale */}
          <AnimatedReveal animation="scale-spring" delay={0.4}>
            <div
              onClick={() => navigate('/category/sale')}
              className="group relative aspect-[3/4] overflow-hidden rounded-xs cursor-pointer shadow-md"
            >
              <img
                src={FASHION_EDITORIAL_IMAGES.categorySale}
                alt="The Sale Edit"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F5742]/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-4 bottom-6 text-center text-white">
                <span className="text-[10px] bg-[#E8A598] text-[#1F5742] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider mb-1 inline-block">
                  {language === 'fr' ? 'PRIX PRIVILÈGE' : 'Special Pricing'}
                </span>
                <h3 className="text-xl font-editorial font-normal">
                  {language === 'fr' ? 'LES VENTES PRIVÉES' : 'THE SALE EDIT'}
                </h3>
                <p className="text-[11px] font-sans-ui text-white/80 uppercase tracking-widest mt-1">
                  {language === 'fr' ? "Jusqu'à -30%" : 'Up to 30% Off'}
                </p>
                <span className="inline-block mt-3 text-[10px] uppercase font-semibold tracking-[0.15em] py-1 px-3 border border-white/40 rounded-xs group-hover:bg-white group-hover:text-[#151515] transition-colors">
                  {t('explore')}
                </span>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS */}
      <section className="bg-[#F7F3EA] py-16 sm:py-20 border-y border-[#E7E3DA] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="slide-left" delay={0.1}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E7E3DA]">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1F5742] font-sans-ui block">
                  {language === 'fr' ? 'COUPS DE CŒUR' : 'EDITOR’S PICKS'}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal text-[#151515] mt-1">
                  {t('featuredPiecesTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="mt-4 sm:mt-0 text-xs font-semibold tracking-[0.15em] uppercase text-[#1F5742] hover:text-[#164030] flex items-center gap-1 transition-colors font-sans-ui cursor-pointer"
              >
                <span>{t('exploreAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product, idx) => (
              <AnimatedReveal key={product.id} animation="soft-rise" delay={0.1 + idx * 0.08}>
                <ProductCard product={product} />
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ALGERIA DELIVERY & PAYMENT ON DELIVERY TRUST STRIP (NO COD MENTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <AnimatedReveal animation="blur-reveal" delay={0.15}>
          <div className="bg-white border border-[#E7E3DA] rounded-xs p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#E7E3DA]">
              <div className="space-y-3 px-4">
                <div className="w-12 h-12 rounded-full bg-[#1F5742]/10 text-[#1F5742] mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold font-sans-ui text-[#151515]">
                  {t('trustPillar1Title')}
                </h3>
                <p className="text-xs text-[#6D6D6D] leading-relaxed">
                  {t('trustPillar1Desc')}
                </p>
              </div>

              <div className="space-y-3 px-4 pt-6 md:pt-0">
                <div className="w-12 h-12 rounded-full bg-[#1F5742]/10 text-[#1F5742] mx-auto flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold font-sans-ui text-[#151515]">
                  {t('trustPillar2Title')}
                </h3>
                <p className="text-xs text-[#6D6D6D] leading-relaxed">
                  {t('trustPillar2Desc')}
                </p>
              </div>

              <div className="space-y-3 px-4 pt-6 md:pt-0">
                <div className="w-12 h-12 rounded-full bg-[#1F5742]/10 text-[#1F5742] mx-auto flex items-center justify-center">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold font-sans-ui text-[#151515]">
                  {t('trustPillar3Title')}
                </h3>
                <p className="text-xs text-[#6D6D6D] leading-relaxed">
                  {t('trustPillar3Desc')}
                </p>
              </div>
            </div>
          </div>
        </AnimatedReveal>
      </section>

      {/* 7. THE SALE EDIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <AnimatedReveal animation="slide-left" delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E7E3DA]">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E8A598] bg-[#1F5742] px-2 py-0.5 rounded-xs inline-block font-sans-ui">
                {language === 'fr' ? 'PRIX PRIVILÈGES' : 'SPECIAL OFFERS'}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal text-[#151515] mt-2">
                {t('theSaleEdit')}
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6D6D] mt-1 font-sans-ui">
                {language === 'fr'
                  ? 'Découvrez une sélection exclusive de pièces d’exception à prix adoucis.'
                  : 'Discover selected wardrobe highlights at exclusive Algerian prices.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/category/sale')}
              className="mt-4 sm:mt-0 text-xs font-semibold tracking-[0.15em] uppercase text-[#1F5742] hover:text-[#164030] flex items-center gap-1 transition-colors font-sans-ui cursor-pointer"
            >
              <span>{language === 'fr' ? 'Voir Toutes les Soldes' : 'Shop All Sale'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {saleProducts.map((product, idx) => (
            <AnimatedReveal key={product.id} animation="scale-spring" delay={0.1 + idx * 0.08}>
              <ProductCard product={product} />
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* 8. BEST SELLERS */}
      <section className="bg-[#F7F3EA] py-16 sm:py-20 border-t border-[#E7E3DA] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="slide-left" delay={0.1}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E7E3DA]">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1F5742] font-sans-ui block">
                  {language === 'fr' ? 'PIÈCES PLÉBISCITÉES' : 'CUSTOMER FAVORITES'}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal text-[#151515] mt-1">
                  {t('bestSellersTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="mt-4 sm:mt-0 text-xs font-semibold tracking-[0.15em] uppercase text-[#1F5742] hover:text-[#164030] flex items-center gap-1 transition-colors font-sans-ui cursor-pointer"
              >
                <span>{t('exploreAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {bestSellers.map((product, idx) => (
              <AnimatedReveal key={product.id} animation="soft-rise" delay={0.1 + idx * 0.08}>
                <ProductCard product={product} />
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
