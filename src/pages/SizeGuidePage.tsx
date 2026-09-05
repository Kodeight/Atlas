import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { AnimatedReveal } from '../components/AnimatedReveal';

export const SizeGuidePage: React.FC = () => {
  const { language } = useShop();
  const [tab, setTab] = useState<'women' | 'men'>('women');

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui flex items-center justify-center gap-1.5">
              <Ruler className="w-4 h-4" />
              <span>{language === 'fr' ? 'GUIDE DES MENSURATIONS' : 'ACCURATE SIZING'}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-normal text-[#151515]">
              {language === 'fr' ? 'GUIDE DES TAILLES' : 'SIZE GUIDE & MEASUREMENTS'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6D6D6D] max-w-md mx-auto">
              {language === 'fr'
                ? 'Toutes les mesures sont exprimées en centimètres (cm). Notre équipe valide systématiquement vos mesures par téléphone avant expédition.'
                : 'All measurements in centimeters (cm). Our team verifies your dimensions over the phone prior to delivery.'}
            </p>
          </div>
        </AnimatedReveal>

        {/* Tab Toggle */}
        <div className="flex justify-center border-b border-[#E7E3DA]">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTab('women')}
              className={`pb-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors border-b-2 cursor-pointer ${
                tab === 'women'
                  ? 'border-[#1F5742] text-[#1F5742]'
                  : 'border-transparent text-[#6D6D6D] hover:text-[#151515]'
              }`}
            >
              {language === 'fr' ? 'COLLECTION FEMME' : 'WOMEN’S COLLECTION'}
            </button>
            <button
              type="button"
              onClick={() => setTab('men')}
              className={`pb-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors border-b-2 cursor-pointer ${
                tab === 'men'
                  ? 'border-[#1F5742] text-[#1F5742]'
                  : 'border-transparent text-[#6D6D6D] hover:text-[#151515]'
              }`}
            >
              {language === 'fr' ? 'COLLECTION HOMME' : 'MEN’S COLLECTION'}
            </button>
          </div>
        </div>

        {/* Women's Table */}
        {tab === 'women' && (
          <AnimatedReveal animation="soft-rise" delay={0.1}>
            <div className="bg-white border border-[#E7E3DA] rounded-xs overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F3EA] text-[#1F5742] uppercase tracking-wider font-semibold border-b border-[#E7E3DA]">
                  <tr>
                    <th className="py-3 px-4">{language === 'fr' ? 'Taille' : 'Size'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Taille DZ / FR' : 'French / DZ Size'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Poitrine (cm)' : 'Bust (cm)'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Taille (cm)' : 'Waist (cm)'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Hanches (cm)' : 'Hips (cm)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DA]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">XS</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">34</td>
                    <td className="py-3 px-4">80 – 84</td>
                    <td className="py-3 px-4">60 – 64</td>
                    <td className="py-3 px-4">86 – 90</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">S</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">36</td>
                    <td className="py-3 px-4">84 – 88</td>
                    <td className="py-3 px-4">64 – 68</td>
                    <td className="py-3 px-4">90 – 94</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">M</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">38 – 40</td>
                    <td className="py-3 px-4">88 – 94</td>
                    <td className="py-3 px-4">68 – 74</td>
                    <td className="py-3 px-4">94 – 100</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">L</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">42</td>
                    <td className="py-3 px-4">94 – 100</td>
                    <td className="py-3 px-4">74 – 80</td>
                    <td className="py-3 px-4">100 – 106</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">XL</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">44</td>
                    <td className="py-3 px-4">100 – 106</td>
                    <td className="py-3 px-4">80 – 86</td>
                    <td className="py-3 px-4">106 – 112</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimatedReveal>
        )}

        {/* Men's Table */}
        {tab === 'men' && (
          <AnimatedReveal animation="soft-rise" delay={0.1}>
            <div className="bg-white border border-[#E7E3DA] rounded-xs overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F3EA] text-[#1F5742] uppercase tracking-wider font-semibold border-b border-[#E7E3DA]">
                  <tr>
                    <th className="py-3 px-4">{language === 'fr' ? 'Taille' : 'Size'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Tour de Cou (cm)' : 'Collar (cm)'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Tour de Torse (cm)' : 'Chest (cm)'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Tour de Taille (cm)' : 'Waist (cm)'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Pantalon (DZ)' : 'Trousers (DZ)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DA]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">S</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">37 – 38</td>
                    <td className="py-3 px-4">90 – 94</td>
                    <td className="py-3 px-4">76 – 80</td>
                    <td className="py-3 px-4">38</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">M</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">39 – 40</td>
                    <td className="py-3 px-4">96 – 100</td>
                    <td className="py-3 px-4">82 – 86</td>
                    <td className="py-3 px-4">40 – 42</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">L</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">41 – 42</td>
                    <td className="py-3 px-4">102 – 106</td>
                    <td className="py-3 px-4">88 – 92</td>
                    <td className="py-3 px-4">44</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">XL</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">43 – 44</td>
                    <td className="py-3 px-4">108 – 114</td>
                    <td className="py-3 px-4">94 – 100</td>
                    <td className="py-3 px-4">46</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1F5742]">XXL</td>
                    <td className="py-3 px-4 text-[#6D6D6D]">45 – 46</td>
                    <td className="py-3 px-4">116 – 122</td>
                    <td className="py-3 px-4">102 – 108</td>
                    <td className="py-3 px-4">48</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimatedReveal>
        )}

        {/* How to Measure Instructions */}
        <AnimatedReveal animation="soft-rise" delay={0.2}>
          <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 rounded-xs space-y-4 text-xs leading-relaxed text-[#151515]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1F5742]">
              {language === 'fr' ? 'Comment Prendre Vos Mesures' : 'How to Take Your Measurements'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>{language === 'fr' ? '1. Tour de Poitrine :' : '1. Bust / Chest:'}</strong>{' '}
                {language === 'fr'
                  ? 'Mesurez au niveau le plus large du buste en gardant le ruban bien horizontal.'
                  : 'Measure around the fullest part of your chest, keeping the tape horizontal under your arms.'}
              </div>
              <div>
                <strong>{language === 'fr' ? '2. Tour de Taille :' : '2. Natural Waist:'}</strong>{' '}
                {language === 'fr'
                  ? 'Mesurez au creux naturel de la taille, juste au-dessus du nombril.'
                  : 'Measure around the narrowest point of your torso, typically right above your navel.'}
              </div>
              <div>
                <strong>{language === 'fr' ? '3. Tour de Bassin :' : '3. Hips:'}</strong>{' '}
                {language === 'fr'
                  ? 'Pieds joints, mesurez à l’endroit le plus large des hanches.'
                  : 'Stand with feet together and measure around the fullest point of your hips.'}
              </div>
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </div>
  );
};
