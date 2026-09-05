import React from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, FREE_DELIVERY_THRESHOLD } from '../services/shippingService';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { AnimatedReveal } from '../components/AnimatedReveal';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, openOrderNow, navigate, language, t } = useShop();

  const freeShippingDifference = FREE_DELIVERY_THRESHOLD - cartSubtotal;

  if (cart.length === 0) {
    return (
      <div className="bg-[#FCFBF7] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <AnimatedReveal animation="blur-reveal" className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F3EA] border border-[#E7E3DA] mx-auto flex items-center justify-center text-[#6D6D6D]">
            <ShoppingBag className="w-8 h-8 text-[#1F5742]" />
          </div>
          <h1 className="text-2xl font-editorial text-[#151515]">{t('emptyBagTitle')}</h1>
          <p className="text-xs text-[#6D6D6D] leading-relaxed">
            {t('emptyBagDesc')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm cursor-pointer"
          >
            {t('shopCollection')}
          </button>
        </AnimatedReveal>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <h1 className="text-3xl font-editorial font-normal text-[#151515] mb-8 pb-4 border-b border-[#E7E3DA]">
            {language === 'fr' ? 'VOTRE PANIER' : 'SHOPPING BAG'} ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </AnimatedReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Alert */}
            <AnimatedReveal animation="soft-rise" delay={0.1} className="bg-[#F7F3EA] border border-[#E7E3DA] p-4 rounded-xs text-xs">
              {freeShippingDifference > 0 ? (
                <p className="text-[#6D6D6D]">
                  {t('addMoreForFreeShipping')}{' '}
                  <span className="font-semibold text-[#1F5742]">{formatCurrency(freeShippingDifference)}</span>{' '}
                  {t('forFreeShipping')}
                </p>
              ) : (
                <p className="text-[#1F5742] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1F5742]" />
                  <span>{t('freeShippingUnlocked')}</span>
                </p>
              )}
              <div className="w-full bg-[#E7E3DA] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#1F5742] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                  }}
                />
              </div>
            </AnimatedReveal>

            {/* Items Table */}
            <div className="bg-white border border-[#E7E3DA] rounded-xs divide-y divide-[#E7E3DA]">
              {cart.map((item, idx) => {
                const image =
                  item.product.images[item.color.imageIndex ?? 0] || item.product.images[0];
                return (
                  <AnimatedReveal
                    key={item.id}
                    animation="soft-rise"
                    delay={0.1 + idx * 0.06}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center"
                  >
                    <img
                      src={image}
                      alt={item.product.name}
                      className="w-20 h-26 object-cover rounded-xs bg-[#F7F3EA] shrink-0"
                    />

                    <div className="grow space-y-1">
                      <span className="text-[10px] font-sans-ui uppercase tracking-wider text-[#6D6D6D]">
                        {item.product.categoryLabel}
                      </span>
                      <h3
                        onClick={() => navigate(`/product/${item.product.slug}`)}
                        className="text-sm font-semibold text-[#151515] hover:text-[#1F5742] cursor-pointer"
                      >
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-[#6D6D6D] pt-1">
                        <span>
                          {language === 'fr' ? 'Taille :' : 'Size:'}{' '}
                          <strong className="text-[#151515]">{item.size}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          {language === 'fr' ? 'Couleur :' : 'Color:'}
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <strong className="text-[#151515]">{item.color.name}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                      <div className="flex items-center border border-[#E7E3DA] rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-[#6D6D6D] hover:text-[#151515] cursor-pointer"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-[#151515]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs text-[#6D6D6D] hover:text-[#151515] cursor-pointer"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#1F5742]">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#6D6D6D] hover:text-red-600 p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </AnimatedReveal>
                );
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-[#F7F3EA] border border-[#E7E3DA] rounded-xs p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F5742]">
              {language === 'fr' ? 'RÉCAPITULATIF DE COMMANDE' : 'ORDER SUMMARY'}
            </h2>

            <div className="space-y-2 text-xs border-b border-[#E7E3DA] pb-4">
              <div className="flex justify-between text-[#6D6D6D]">
                <span>{t('subtotal')}:</span>
                <span className="font-semibold text-[#151515]">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6D6D6D]">
                <span>{t('shipping')}:</span>
                <span>{language === 'fr' ? 'Calculé à la commande' : 'Calculated at checkout'}</span>
              </div>
              <div className="flex justify-between text-xs text-[#1F5742] pt-1">
                <span>{t('paymentMethodTitle')}:</span>
                <span className="font-semibold">{t('paymentMethodDesc')}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline text-sm font-bold text-[#151515]">
              <span>{language === 'fr' ? 'Sous-total Estimé :' : 'Estimated Subtotal:'}</span>
              <span className="text-lg text-[#1F5742]">{formatCurrency(cartSubtotal)}</span>
            </div>

            <button
              type="button"
              onClick={() => openOrderNow({ isFromCart: true })}
              className="w-full py-4 px-6 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-xs transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>{t('orderNowPayOnDelivery')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#6D6D6D]">
              <ShieldCheck className="w-4 h-4 text-[#1F5742]" />
              <span>
                {language === 'fr'
                  ? 'Paiement à la livraison • Aucune carte requise'
                  : 'Payment on delivery • No card required'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
