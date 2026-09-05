import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { AnimatedReveal } from '../components/AnimatedReveal';

export const FaqPage: React.FC = () => {
  const { navigate, language, t } = useShop();

  const faqsEn = [
    {
      q: 'How does Payment on Delivery work?',
      a: 'Payment on Delivery means you never have to pay online with a credit card or bank transfer. You place your order directly through our website, our Alger team calls you to confirm your address and size, and you pay in cash to the courier agent when your package is delivered to your door.',
    },
    {
      q: 'Do you deliver to all 69 Algerian Wilayas?',
      a: 'Yes, Atlas delivers to all 69 Wilayas across Algeria, from Algiers, Oran, and Constantine, to In Salah, Djanet, Bordj Badji Mokhtar, and Tindouf. Delivery fees vary from 400 DA to 1,200 DA depending on your location, and delivery is completely FREE on orders over 20,000 DA.',
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders in Algiers, Blida, Boumerdes, and Tipaza are typically delivered within 24 to 48 hours. Northern and Coastal wilayas take 2 to 3 days, while Southern and Oasis wilayas arrive in 3 to 5 business days.',
    },
    {
      q: 'Will you call me before delivering my package?',
      a: 'Yes, absolutely. We always place two calls: first, an order confirmation call from our headquarters to verify your sizing and delivery instructions; second, a call from the courier on the morning of delivery to coordinate the exact time and location.',
    },
    {
      q: 'What if the size does not fit? Can I exchange it?',
      a: 'We offer size exchanges within 7 days of delivery. The item must be in unworn, original condition with tags attached. Please contact our WhatsApp or phone support line (+213 550 12 34 56) to organize an exchange with our courier.',
    },
    {
      q: 'Are all prices displayed in Algerian Dinars (DA)?',
      a: 'Yes, all prices listed across the Atlas catalog are strictly in Algerian Dinars (DZD / DA) and include all applicable taxes.',
    },
  ];

  const faqsFr = [
    {
      q: 'Comment fonctionne le paiement à la livraison ?',
      a: 'Le paiement à la livraison vous évite tout paiement en ligne ou carte bancaire. Vous passez commande en toute sérénité sur le site, notre équipe d’Alger vous appelle pour valider la taille et votre adresse, puis vous réglez en espèces directement au livreur lors de la réception de votre colis.',
    },
    {
      q: 'Livrez-vous dans l’ensemble des 69 wilayas algériennes ?',
      a: 'Oui, Atlas dessert la totalité des 69 wilayas d’Algérie, d’Alger à Oran, Constantine, Annaba, jusqu’à In Salah, Djanet, Bordj Badji Mokhtar et Tindouf. Les frais de livraison sont calculés selon la zone (de 400 à 1 200 DA) et la livraison est offerte dès 20 000 DA d’achats.',
    },
    {
      q: 'Quels sont les délais d’expédition ?',
      a: 'Les commandes sur Alger, Blida, Boumerdès et Tipaza sont livrées en 24 à 48 heures. Les wilayas du Nord et du littoral en 2 à 3 jours ouvrés, et les wilayas du Sud et des Oasis en 3 à 5 jours.',
    },
    {
      q: 'M’appelle-t-on avant la livraison de mon colis ?',
      a: 'Tout à fait. Nous effectuons deux appels : un premier appel de notre service client pour vérifier les mensurations et l’adresse, puis un second appel direct du livreur le jour du passage pour convenir de l’heure exacte.',
    },
    {
      q: 'Que faire si la taille ne me convient pas ? Puis-je échanger ?',
      a: 'Nous assurons les échanges de taille sous 7 jours après réception. La pièce doit être neuve avec ses étiquettes d’origine. Contactez simplement notre support WhatsApp ou téléphonique (+213 550 12 34 56) pour organiser le passage du livreur.',
    },
    {
      q: 'Tous les prix sont-ils en Dinars Algériens (DA) ?',
      a: 'Oui, l’ensemble des tarifs affichés sur la boutique Atlas sont strictement libellés en Dinars Algériens (DA) et comprennent toutes les taxes applicables.',
    },
  ];

  const faqs = language === 'fr' ? faqsFr : faqsEn;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'fr' ? 'AIDE & CONSEILS' : 'HELP & ADVICE'}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-normal text-[#151515]">
              {language === 'fr' ? 'FOIRE AUX QUESTIONS' : 'FREQUENTLY ASKED QUESTIONS'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6D6D6D] max-w-md mx-auto">
              {language === 'fr'
                ? 'Tout ce que vous devez savoir sur vos achats, le choix des tailles et le paiement à la livraison.'
                : 'Everything you need to know about shopping, sizing, and payment on delivery at Atlas.'}
            </p>
          </div>
        </AnimatedReveal>

        {/* FAQ Accordion list */}
        <AnimatedReveal animation="soft-rise" delay={0.15}>
          <div className="bg-white border border-[#E7E3DA] rounded-xs divide-y divide-[#E7E3DA] shadow-xs">
            {faqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="p-5 sm:p-6">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-medium text-[#151515] group-hover:text-[#1F5742] transition-colors">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#1F5742] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6D6D6D] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-[#6D6D6D] leading-relaxed font-sans-ui">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </AnimatedReveal>

        {/* Support Callout */}
        <AnimatedReveal animation="scale-spring" delay={0.25}>
          <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 rounded-xs text-center space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#151515]">
              {language === 'fr' ? 'Une Autre Question ?' : 'Still Have Questions?'}
            </h3>
            <p className="text-xs text-[#6D6D6D]">
              {language === 'fr'
                ? 'Notre équipe d’assistance clientèle en Algérie est à votre disposition du samedi au jeudi.'
                : 'Our Algerian customer care team is available Saturday to Thursday to assist you.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="px-6 py-2.5 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              {t('navContact')}
            </button>
          </div>
        </AnimatedReveal>
      </div>
    </div>
  );
};
