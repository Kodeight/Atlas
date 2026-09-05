import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { AnimatedReveal } from '../components/AnimatedReveal';

export const ContactPage: React.FC = () => {
  const { showToast, language } = useShop();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSent(true);
    showToast(
      language === 'fr'
        ? 'Votre message a bien été envoyé. Notre équipe vous recontactera rapidement !'
        : 'Your message has been sent. Our team will contact you shortly!'
    );
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#1F5742] font-sans-ui">
              {language === 'fr' ? 'À VOTRE ÉCOUTE' : 'WE ARE HERE FOR YOU'}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-normal text-[#151515]">
              {language === 'fr' ? 'CONTACTEZ ATLAS' : 'CONTACT ATLAS'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6D6D6D] max-w-md mx-auto">
              {language === 'fr'
                ? 'Une question sur nos tailles, votre livraison ou votre commande en cours ? Contactez notre service client en Algérie.'
                : 'Have questions regarding sizes, deliveries, or current orders? Reach out to our Algerian care team.'}
            </p>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="md:col-span-5">
            <AnimatedReveal animation="soft-rise" delay={0.1}>
              <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 sm:p-8 rounded-xs space-y-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F5742]">
                  {language === 'fr' ? 'SERVICE RELATION CLIENTÈLE' : 'CUSTOMER SERVICE DESK'}
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#1F5742] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#6D6D6D] block">
                        {language === 'fr' ? 'Téléphone & WhatsApp :' : 'Phone & WhatsApp:'}
                      </span>
                      <strong className="text-[#151515]">+213 (0) 550 12 34 56</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#1F5742] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#6D6D6D] block">
                        {language === 'fr' ? 'Courrier Électronique :' : 'Email Inquiries:'}
                      </span>
                      <strong className="text-[#151515]">contact@atlasfashion.dz</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#1F5742] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#6D6D6D] block">
                        {language === 'fr' ? 'Showroom & Siège :' : 'Showroom & Headquarters:'}
                      </span>
                      <span className="text-[#151515]">Boulevard Sidi Yahia, Hydra, Alger, Algérie</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#1F5742] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#6D6D6D] block">
                        {language === 'fr' ? 'Horaires d’Ouverture :' : 'Opening Hours:'}
                      </span>
                      <span className="text-[#151515]">
                        {language === 'fr' ? 'Samedi – Jeudi : 09h00 – 18h00' : 'Saturday – Thursday: 09:00 – 18:00'}
                      </span>
                      <span className="text-[#6D6D6D] block text-[11px]">
                        {language === 'fr' ? '(Fermé le vendredi)' : '(Closed on Fridays)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            <AnimatedReveal animation="scale-spring" delay={0.15}>
              <div className="bg-white border border-[#E7E3DA] p-6 sm:p-8 rounded-xs">
                {sent ? (
                  <div className="text-center py-8 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-[#1F5742] mx-auto" />
                    <h3 className="text-xl font-editorial text-[#151515]">
                      {language === 'fr' ? 'MESSAGE BIEN REÇU' : 'MESSAGE RECEIVED'}
                    </h3>
                    <p className="text-xs text-[#6D6D6D]">
                      {language === 'fr'
                        ? 'Merci. Un conseiller vous contactera par téléphone ou email dans les plus brefs délais.'
                        : 'Thank you. An advisor will contact you by telephone or email within standard business hours.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-4 px-6 py-2 border border-[#E7E3DA] text-xs font-semibold uppercase rounded-xs cursor-pointer"
                    >
                      {language === 'fr' ? 'Envoyer un autre message' : 'Send another inquiry'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F5742] mb-2">
                      {language === 'fr' ? 'Écrivez-nous Directement' : 'Send Us a Direct Message'}
                    </h2>

                    <div>
                      <label className="block text-xs font-semibold text-[#151515] mb-1">
                        {language === 'fr' ? 'Votre Nom Complet' : 'Your Name'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'fr' ? 'ex. Samia K.' : 'e.g. Samia K.'}
                        className="w-full bg-[#FCFBF7] border border-[#E7E3DA] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#1F5742]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#151515] mb-1">
                        {language === 'fr' ? 'Numéro de Téléphone' : 'Phone Number'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05 50 12 34 56"
                        className="w-full bg-[#FCFBF7] border border-[#E7E3DA] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#1F5742]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#151515] mb-1">
                        {language === 'fr' ? 'Message ou Référence Commande' : 'Inquiry or Order Reference'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          language === 'fr'
                            ? 'Comment pouvons-nous vous aider concernant vos tailles ou votre livraison ?'
                            : 'How can we assist you with your order or sizing?'
                        }
                        className="w-full bg-[#FCFBF7] border border-[#E7E3DA] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#1F5742]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Envoyer le Message' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </div>
    </div>
  );
};
