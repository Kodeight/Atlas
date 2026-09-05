import React from 'react';
import { AtlasStarIcon } from '../components/BrandElements';
import { FASHION_EDITORIAL_IMAGES } from '../services/imageService';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';
import { AnimatedReveal } from '../components/AnimatedReveal';

export const AboutPage: React.FC = () => {
  const { navigate, language, t } = useShop();

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui">
              <AtlasStarIcon className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'NOTRE HISTOIRE' : 'OUR STORY'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-editorial font-normal text-[#151515]">
              {language === 'fr' ? 'À PROPOS D’ATLAS' : 'ABOUT ATLAS'}
            </h1>
            <p className="text-sm sm:text-base text-[#6D6D6D] max-w-xl mx-auto leading-relaxed">
              {language === 'fr'
                ? 'Une maison de prêt-à-porter algérienne dédiée à la simplicité raffinée, aux belles matières et à une élégance contemporaine sans effort.'
                : 'A contemporary Algerian fashion house dedicated to refined simplicity, natural drape, and effortless modern dressing.'}
            </p>
          </div>
        </AnimatedReveal>

        {/* Hero Editorial Photo */}
        <AnimatedReveal animation="clip-curtain" delay={0.15}>
          <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden shadow-lg border border-[#E7E3DA]">
            <img
              src={FASHION_EDITORIAL_IMAGES.aboutStory}
              alt="Atlas Fashion Studio"
              className="w-full h-full object-cover"
            />
          </div>
        </AnimatedReveal>

        {/* Brand Philosophy Narrative */}
        <AnimatedReveal animation="soft-rise" delay={0.2}>
          <div className="space-y-6 text-sm sm:text-base text-[#151515] leading-relaxed font-sans-ui">
            <h2 className="text-2xl sm:text-3xl font-editorial font-normal text-[#1F5742]">
              {language === 'fr' ? 'Une Élégance Ancrée dans l’Héritage' : 'Elegance Rooted in Heritage'}
            </h2>
            <p>
              {language === 'fr'
                ? 'Atlas est né d’une vision claire : concevoir une garde-robe qui incarne l’énergie vibrante et la distinction naturelle de l’Algérie contemporaine. Du tailleur en lin structuré aux robes fluides du soir, chaque création répond à une exigence rigoureuse de confort, de coupe impeccable et de durabilité.'
                : 'Atlas was conceived with a deliberate vision: to craft a wardrobe that mirrors the vibrant energy and relaxed sophistication of modern Algeria. From tailored linen blazers to airy evening maxis, every garment is measured against our core principles of comfort, tactile quality, and lasting style.'}
            </p>
            <p>
              {language === 'fr'
                ? 'Nous pensons que la haute qualité vestimentaire doit s’accompagner d’une expérience d’achat limpide et rassurante. C’est pourquoi nous assurons la livraison directe avec paiement à la réception sur l’ensemble des 69 wilayas, vous garantissant un essayage en toute confiance.'
                : 'We believe that great fashion should be effortless to acquire. That is why we operate an exclusive payment upon delivery service covering every corner of the country, ensuring that whether you reside in Algiers, Oran, Constantine, or the South, premium style is delivered directly to your hands with complete trust.'}
            </p>
          </div>
        </AnimatedReveal>

        {/* Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#E7E3DA]">
          <AnimatedReveal animation="soft-rise" delay={0.25}>
            <div className="bg-[#F7F3EA] p-6 rounded-xs space-y-2 border border-[#E7E3DA] h-full">
              <Sparkles className="w-6 h-6 text-[#1F5742]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#151515]">
                {language === 'fr' ? 'Fibres Nobles & Naturelles' : 'Natural Textiles'}
              </h3>
              <p className="text-xs text-[#6D6D6D] leading-relaxed">
                {language === 'fr'
                  ? 'Nous privilégions les lins lavés, la viscose fluide respirante et les cotons fins qui s’adaptent au climat algérien.'
                  : 'We prioritize washed European linens, breathable eco-viscose, and fine cottons that adapt gracefully to the Algerian climate.'}
              </p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal animation="soft-rise" delay={0.35}>
            <div className="bg-[#F7F3EA] p-6 rounded-xs space-y-2 border border-[#E7E3DA] h-full">
              <ShieldCheck className="w-6 h-6 text-[#1F5742]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#151515]">
                {language === 'fr' ? 'Confiance à Domicile' : 'Doorstep Trust'}
              </h3>
              <p className="text-xs text-[#6D6D6D] leading-relaxed">
                {language === 'fr'
                  ? 'Aucun risque de paiement en ligne. Vous réglez directement au livreur, avec confirmation préalable de vos mensurations par téléphone.'
                  : 'No digital credit card friction. Pay solely when the courier delivers your garment, with telephone sizing verification.'}
              </p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal animation="soft-rise" delay={0.45}>
            <div className="bg-[#F7F3EA] p-6 rounded-xs space-y-2 border border-[#E7E3DA] h-full">
              <HeartHandshake className="w-6 h-6 text-[#1F5742]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#151515]">
                {language === 'fr' ? 'Service Client Dédié' : 'Customer Service'}
              </h3>
              <p className="text-xs text-[#6D6D6D] leading-relaxed">
                {language === 'fr'
                  ? 'Une équipe basée à Alger, disponible du samedi au jeudi pour vous guider sur les tailles et le suivi d’expédition.'
                  : 'Dedicated customer support based in Algeria, ready to assist with sizing advice, exchanges, and swift order tracking.'}
              </p>
            </div>
          </AnimatedReveal>
        </div>

        {/* CTA */}
        <AnimatedReveal animation="scale-spring" delay={0.5}>
          <div className="text-center pt-8 border-t border-[#E7E3DA]">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              {t('shopCollection')}
            </button>
          </div>
        </AnimatedReveal>
      </div>
    </div>
  );
};
