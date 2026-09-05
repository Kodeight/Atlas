import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ShoppingBag, Zap, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../services/shippingService';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, addToCart, openOrderNow, navigate, language, t } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(quickViewProduct?.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIndex(0);
      setSelectedSize(quickViewProduct.sizes[0] || '');
      setSelectedColor(quickViewProduct.colors[0]);
      setQuantity(1);
      setSizeError(false);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    addToCart(product, selectedSize, selectedColor || product.colors[0], quantity);
    closeQuickView();
  };

  const handleOrderNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    openOrderNow({
      product,
      size: selectedSize,
      color: selectedColor || product.colors[0],
      quantity,
    });
    closeQuickView();
  };

  const handleViewDetails = () => {
    closeQuickView();
    navigate(`/product/${product.slug}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={closeQuickView}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-3xl bg-[#FCFBF7] rounded-sm shadow-2xl border border-[#E7E3DA] overflow-hidden z-10 my-auto flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeQuickView}
            className="absolute top-3 right-3 p-1.5 text-[#151515] bg-white/80 hover:bg-white rounded-full z-20 shadow-xs transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Gallery on Left */}
          <div className="md:w-1/2 bg-[#FCFBF7] relative flex flex-col">
            <div className="w-full aspect-[4/5] relative overflow-hidden">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Mini thumbnails */}
            {product.images.length > 1 && (
              <div className="p-3 bg-[#F7F3EA] flex gap-2 border-t border-[#E7E3DA] overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-14 rounded-xs overflow-hidden border shrink-0 ${
                      activeImageIndex === idx ? 'border-[#1F5742] ring-1 ring-[#1F5742]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details on Right */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-[11px] font-sans-ui uppercase tracking-wider text-[#6D6D6D]">
                {product.categoryLabel}
              </span>

              <h2 className="text-xl sm:text-2xl font-editorial text-[#151515] font-normal leading-snug">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-2.5">
                {product.salePrice ? (
                  <>
                    <span className="text-sm text-[#6D6D6D] line-through font-sans-ui">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-lg font-bold text-[#1F5742] font-sans-ui">
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span className="text-[10px] uppercase font-semibold bg-[#1F5742] text-white px-2 py-0.5 rounded-xs">
                      {language === 'fr' ? 'SOLDES' : 'SALE'}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-[#151515] font-sans-ui">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6D6D6D] leading-relaxed line-clamp-3">
                {product.shortDescription || product.description}
              </p>

              {/* Color Swatches */}
              {product.colors.length > 0 && (
                <div className="space-y-1.5 py-1.5">
                  <span className="text-xs font-semibold text-[#151515] block">
                    {language === 'fr' ? 'Couleur :' : 'Color:'} <span className="font-normal text-[#6D6D6D]">{selectedColor?.name}</span>
                  </span>
                  <div className="flex items-center gap-2 py-0.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor?.name === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                          }}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'ring-2 ring-[#1F5742] border-white scale-110' : 'border-black/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          aria-label={color.name}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white drop-shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="space-y-1.5 py-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#151515]">
                    {t('selectSize')}: <span className="font-normal text-[#6D6D6D]">{selectedSize}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        className={`min-w-[42px] h-9 px-2 text-xs font-semibold rounded-xs border transition-colors ${
                          isSelected
                            ? 'bg-[#1F5742] text-white border-[#1F5742]'
                            : 'bg-white text-[#151515] border-[#E7E3DA] hover:border-[#1F5742]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {language === 'fr' ? 'Veuillez sélectionner une taille.' : 'Please select a size to proceed.'}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-[#151515]">{t('quantity')}:</span>
                <div className="flex items-center border border-[#E7E3DA] rounded bg-[#FCFBF7]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-xs text-[#6D6D6D] hover:text-[#151515]"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold text-[#151515]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1 text-xs text-[#6D6D6D] hover:text-[#151515]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Dual Action Buttons (NO COD MENTION) */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 px-3 bg-white border border-[#1F5742] hover:bg-[#F7F3EA] text-[#1F5742] text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('addToBag')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="w-full py-3 px-3 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <Zap className="w-4 h-4 text-[#E8A598]" />
                  <span>{t('orderNowPayOnDelivery')}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6D6D6D] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F5742]" />
                  <span>
                    {language === 'fr'
                      ? 'Paiement à la livraison sur les 69 Wilayas'
                      : 'Payment on delivery across all 69 Wilayas'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleViewDetails}
                  className="text-[#1F5742] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <span>{language === 'fr' ? 'Détails Complets' : 'Full Details'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
