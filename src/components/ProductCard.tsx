import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../services/shippingService';
import { Eye, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, openQuickView, openOrderNow, t, language } = useShop();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  const displayImage = product.images[0];

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  const handleOrderNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = selectedColor || product.colors[0];
    const defaultSize = product.sizes[0] || 'M';
    openOrderNow({
      product,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative flex flex-col cursor-pointer bg-transparent"
      onClick={handleCardClick}
    >
      {/* Image Container with 4:5 Aspect Ratio */}
      <div className="relative w-full aspect-[4/5] bg-[#FCFBF7] overflow-hidden rounded-lg">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isSale && (
            <span className="bg-[#1F5742] text-[#FCFBF7] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-md">
              {language === 'fr' ? 'SOLDES' : 'SALE'}
            </span>
          )}
          {product.isNew && !product.isSale && (
            <span className="bg-[#F7F3EA] text-[#1F5742] border border-[#1F5742]/20 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-md">
              {language === 'fr' ? 'NOUVEAU' : 'NEW'}
            </span>
          )}
        </div>

        {/* Hover Action Overlay with Tactile Recoil */}
        <div className="absolute inset-x-2 bottom-2.5 flex gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250 z-20">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="flex-1 bg-[#FCFBF7] hover:bg-white text-[#151515] text-[11px] font-semibold uppercase tracking-wider py-2 px-2 rounded-lg shadow-md backdrop-blur-xs flex items-center justify-center gap-1 transition-colors active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-[#1F5742]" />
            <span>{t('quickView')}</span>
          </button>
          <button
            type="button"
            onClick={handleOrderNowClick}
            className="flex-1 bg-[#1F5742] hover:bg-[#164030] text-white text-[11px] font-semibold uppercase tracking-wider py-2 px-2 rounded-lg shadow-md flex items-center justify-center gap-1 transition-colors active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-[#E8A598]" />
            <span>{language === 'fr' ? 'Commander' : 'Order Now'}</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-1 flex flex-col grow">
        {/* Category */}
        <span className="text-[11px] font-sans-ui uppercase tracking-[0.12em] text-[#6D6D6D]">
          {product.categoryLabel}
        </span>

        {/* Product Title */}
        <h3 className="text-sm sm:text-[15px] font-medium text-[#151515] group-hover:text-[#1F5742] transition-colors line-clamp-1 mt-0.5 font-sans-ui">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="mt-1 flex items-baseline gap-2">
          {product.salePrice ? (
            <>
              <span className="text-xs text-[#6D6D6D] line-through font-sans-ui">
                {formatCurrency(product.price)}
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#1F5742] font-sans-ui">
                {formatCurrency(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-semibold text-[#151515] font-sans-ui">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1.5 my-2.5">
            {product.colors.map((color) => (
              <button
                key={`${color.name}-${color.hex}`}
                type="button"
                aria-label={color.displayName ? `Select ${color.displayName}` : `Color ${color.hex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`w-3 h-3 rounded-full border transition-colors ${
                  selectedColor?.name === color.name
                    ? 'border-[#1F5742] ring-1 ring-[#1F5742]'
                    : 'border-[#E7E3DA]/50'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span className="text-[10px] text-[#6D6D6D] ml-1">
              {product.colors.length} {language === 'fr' ? 'couleurs' : 'colors'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
