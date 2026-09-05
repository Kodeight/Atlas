import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, FREE_DELIVERY_THRESHOLD } from '../services/shippingService';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    openOrderNow,
    navigate,
    language,
    t,
  } = useShop();

  const freeShippingDifference = FREE_DELIVERY_THRESHOLD - cartSubtotal;

  const handleCheckout = () => {
    openOrderNow({ isFromCart: true });
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md bg-[#FCFBF7] text-[#151515] h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#1F5742] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E7E3DA]" />
                <h2 className="text-sm font-semibold tracking-[0.15em] uppercase font-sans-ui text-white">
                  {language === 'fr' ? 'VOTRE PANIER' : 'YOUR BAG'} ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-[#F7F3EA] px-6 py-2.5 border-b border-[#E7E3DA] text-xs">
              {freeShippingDifference > 0 ? (
                <p className="text-[#6D6D6D]">
                  {t('addMoreForFreeShipping')}{' '}
                  <span className="font-semibold text-[#1F5742]">{formatCurrency(freeShippingDifference)}</span>{' '}
                  {t('forFreeShipping')}
                </p>
              ) : (
                <p className="text-[#1F5742] font-semibold flex items-center gap-1">
                  <span>{t('freeShippingUnlocked')}</span>
                </p>
              )}
              <div className="w-full bg-[#E7E3DA] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <motion.div
                  className="bg-[#1F5742] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F7F3EA] border border-[#E7E3DA] mx-auto flex items-center justify-center text-[#6D6D6D]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-editorial text-[#151515]">{t('emptyBagTitle')}</h3>
                    <p className="text-xs text-[#6D6D6D] mt-1 max-w-xs mx-auto">
                      {t('emptyBagDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                    className="px-6 py-2.5 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors active:scale-95"
                  >
                    {t('shopCollection')}
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const image =
                    item.product.images[item.color.imageIndex ?? 0] || item.product.images[0];
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-[#E7E3DA] last:border-0 items-start"
                    >
                      <img
                        src={image}
                        alt={item.product.name}
                        className="w-18 h-24 object-cover object-center rounded bg-[#F7F3EA] shrink-0"
                      />
                      <div className="grow flex flex-col justify-between self-stretch">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4
                              onClick={() => {
                                setIsCartOpen(false);
                                navigate(`/product/${item.product.slug}`);
                              }}
                              className="text-xs font-semibold text-[#151515] hover:text-[#1F5742] cursor-pointer line-clamp-1"
                            >
                              {item.product.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#6D6D6D] hover:text-red-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-[11px] text-[#6D6D6D] space-y-0.5 mt-0.5">
                            <p>
                              {language === 'fr' ? 'Taille :' : 'Size:'}{' '}
                              <span className="text-[#151515] font-medium">{item.size}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span>{language === 'fr' ? 'Couleur :' : 'Color:'}</span>
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: item.color.hex }}
                              />
                              <span className="text-[#151515] font-medium">{item.color.name}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-[#E7E3DA] rounded bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-[#6D6D6D] hover:text-[#151515]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-[#151515]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-[#6D6D6D] hover:text-[#151515]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-semibold text-[#1F5742]">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Actions (NO COD MENTION) */}
            {cart.length > 0 && (
              <div className="p-6 bg-[#F7F3EA] border-t border-[#E7E3DA] space-y-4 shrink-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans-ui text-[#6D6D6D] uppercase tracking-wider text-xs">
                    {t('subtotal')}
                  </span>
                  <span className="font-semibold text-[#151515] text-base">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>

                <div className="text-[11px] text-[#6D6D6D] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F5742] shrink-0" />
                  <span>
                    {language === 'fr'
                      ? 'Paiement à la livraison • Frais calculés à la commande'
                      : 'Payment on delivery • Delivery fee calculated at order step'}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-3.5 px-4 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-[0.15em] rounded transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>{t('orderNowPayOnDelivery')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleViewCart}
                    className="w-full py-2.5 px-4 bg-white hover:bg-[#FCFBF7] border border-[#E7E3DA] text-[#151515] text-xs font-medium uppercase tracking-wider rounded transition-colors text-center block cursor-pointer"
                  >
                    {language === 'fr' ? 'Consulter le Panier en Détail' : 'View Bag & Details'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
