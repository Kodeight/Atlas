import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ALGERIAN_WILAYAS } from '../data/wilayas';
import { formatCurrency, FREE_DELIVERY_THRESHOLD } from '../services/shippingService';
import { Search } from 'lucide-react';
import { AnimatedReveal } from '../components/AnimatedReveal';

export const ShippingPage: React.FC = () => {
  const { language } = useShop();
  const [search, setSearch] = useState('');

  const filteredWilayas = ALGERIAN_WILAYAS.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) || w.code.includes(search)
  );

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui">
              {language === 'fr' ? 'POLITIQUE DE LIVRAISON' : 'DELIVERY POLICY'}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-normal text-[#151515]">
              {language === 'fr' ? 'LIVRAISON SUR LES 69 WILAYAS' : 'SHIPPING ACROSS 69 WILAYAS'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6D6D6D] max-w-xl mx-auto">
              {language === 'fr'
                ? `Livraison à domicile avec paiement direct à la réception sur l’ensemble du territoire algérien. Livraison gratuite dès ${formatCurrency(FREE_DELIVERY_THRESHOLD)} d’achats.`
                : `Door-to-door delivery with payment upon arrival throughout all regions of Algeria. Free delivery on orders over ${formatCurrency(FREE_DELIVERY_THRESHOLD)}.`}
            </p>
          </div>
        </AnimatedReveal>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedReveal animation="soft-rise" delay={0.1}>
            <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 rounded-xs space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-[#1F5742] text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-sm font-semibold text-[#151515] uppercase tracking-wider pt-2">
                {language === 'fr' ? 'Commandez en 1 Clic' : 'Place Your Order'}
              </h3>
              <p className="text-xs text-[#6D6D6D] leading-relaxed">
                {language === 'fr'
                  ? 'Choisissez vos pièces, votre taille et votre wilaya. Aucun paiement préalable ni carte bancaire n’est requis.'
                  : 'Select your pieces, size, and destination wilaya. No credit card or prepayment is required.'}
              </p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal animation="soft-rise" delay={0.2}>
            <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 rounded-xs space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-[#1F5742] text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-sm font-semibold text-[#151515] uppercase tracking-wider pt-2">
                {language === 'fr' ? 'Confirmation Téléphonique' : 'Phone Confirmation'}
              </h3>
              <p className="text-xs text-[#6D6D6D] leading-relaxed">
                {language === 'fr'
                  ? 'Notre équipe d’Alger vous contacte par appel pour vérifier vos mensurations, votre adresse exacte et le créneau idéal.'
                  : 'Our Alger desk contacts you to double-check your measurements, street address, and optimal delivery time.'}
              </p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal animation="soft-rise" delay={0.3}>
            <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 rounded-xs space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-[#1F5742] text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="text-sm font-semibold text-[#151515] uppercase tracking-wider pt-2">
                {language === 'fr' ? 'Paiement à la Livraison' : 'Payment on Delivery'}
              </h3>
              <p className="text-xs text-[#6D6D6D] leading-relaxed">
                {language === 'fr'
                  ? 'Le livreur se présente à votre adresse. Vous réceptionnez le colis et réglez en espèces directement.'
                  : 'The delivery agent arrives at your door. You inspect the parcel and pay directly in cash upon arrival.'}
              </p>
            </div>
          </AnimatedReveal>
        </div>

        {/* Wilaya Rates Table with Search */}
        <AnimatedReveal animation="soft-rise" delay={0.25}>
          <div className="bg-white border border-[#E7E3DA] rounded-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-editorial text-[#151515]">
                  {language === 'fr' ? 'Grille Tarifaire des 69 Wilayas' : 'Wilaya Delivery Rate Directory'}
                </h2>
                <p className="text-xs text-[#6D6D6D]">
                  {language === 'fr'
                    ? 'Tarifs standardisés pour l’ensemble des 69 wilayas algériennes'
                    : 'Showing standardized courier rates for all 69 Algerian Wilayas'}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#6D6D6D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={language === 'fr' ? 'Rechercher wilaya ou code...' : 'Search wilaya name or code...'}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F3EA] border border-[#E7E3DA] rounded-xs focus:outline-none focus:border-[#1F5742]"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-[#E7E3DA] rounded-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F3EA] text-[#1F5742] uppercase tracking-wider font-semibold border-b border-[#E7E3DA] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">{language === 'fr' ? 'Code' : 'Code'}</th>
                    <th className="py-2.5 px-4">{language === 'fr' ? 'Wilaya' : 'Wilaya Name'}</th>
                    <th className="py-2.5 px-4">{language === 'fr' ? 'Zone' : 'Zone'}</th>
                    <th className="py-2.5 px-4">{language === 'fr' ? 'Délai Estimé' : 'Estimated Delivery'}</th>
                    <th className="py-2.5 px-4 text-right">{language === 'fr' ? 'Frais Standard' : 'Standard Fee'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DA]">
                  {filteredWilayas.map((w) => (
                    <tr key={w.code} className="hover:bg-[#FCFBF7]">
                      <td className="py-2 px-4 font-mono font-semibold text-[#1F5742]">{w.code}</td>
                      <td className="py-2 px-4 font-medium text-[#151515]">{w.name}</td>
                      <td className="py-2 px-4 capitalize text-[#6D6D6D]">{w.zone}</td>
                      <td className="py-2 px-4 text-[#6D6D6D]">{w.estimatedDays}</td>
                      <td className="py-2 px-4 text-right font-semibold text-[#151515]">
                        {w.deliveryFee} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </div>
  );
};
