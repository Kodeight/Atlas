import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { getProductBySlug, getRelatedProducts, PRODUCTS_DATA } from '../data/products';
import { ProductGallery } from '../components/ProductGallery';
import { ProductCard } from '../components/ProductCard';
import { AnimatedReveal } from '../components/AnimatedReveal';
import { formatCurrency } from '../services/shippingService';
import {
  ShieldCheck,
  ShoppingBag,
  Zap,
  ChevronDown,
  ChevronUp,
  Ruler,
  Star,
  Check,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { addToCart, openOrderNow, navigate, language, t } = useShop();

  const product = getProductBySlug(slug) || PRODUCTS_DATA[0];

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Track recently viewed
  useEffect(() => {
    try {
      const stored = localStorage.getItem('atlas_recently_viewed');
      const recentIds: string[] = stored ? JSON.parse(stored) : [];
      const updated = [product.id, ...recentIds.filter((id) => id !== product.id)].slice(0, 6);
      localStorage.setItem('atlas_recently_viewed', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [product.id]);

  useEffect(() => {
    setSelectedSize(product.sizes[0] || '');
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setSizeError(false);
  }, [product]);

  const relatedProducts = getRelatedProducts(product.id, product.category, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    addToCart(product, selectedSize, selectedColor || product.colors[0], quantity);
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
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <nav className="text-xs text-[#6D6D6D] mb-6 flex items-center gap-1.5 flex-wrap font-sans-ui">
            <button type="button" onClick={() => navigate('/')} className="hover:text-[#1F5742] cursor-pointer">
              {t('navHome')}
            </button>
            <span>/</span>
            <button type="button" onClick={() => navigate('/shop')} className="hover:text-[#1F5742] cursor-pointer">
              {t('navShop')}
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate(`/category/${product.category}`)}
              className="hover:text-[#1F5742] cursor-pointer"
            >
              {product.categoryLabel}
            </button>
            <span>/</span>
            <span className="text-[#151515] font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </AnimatedReveal>

        {/* Main Product Layout: Gallery (Left) + Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Gallery Column */}
          <div className="lg:col-span-7">
            <AnimatedReveal animation="clip-curtain" delay={0.1}>
              <ProductGallery images={product.images} productName={product.name} />
            </AnimatedReveal>
          </div>

          {/* Details & Ordering Column */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <AnimatedReveal animation="slide-right" delay={0.15}>
              {/* Header info */}
              <div>
                <span className="text-xs font-sans-ui uppercase tracking-[0.2em] text-[#6D6D6D] block">
                  {product.categoryLabel}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-normal text-[#151515] mt-1">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-[#6D6D6D] font-sans-ui">
                    {product.rating} ({product.reviewsCount} {language === 'fr' ? 'avis vérifiés' : 'customer reviews'})
                  </span>
                </div>

                {/* Pricing */}
                <div className="mt-4 flex items-baseline gap-3">
                  {product.salePrice ? (
                    <>
                      <span className="text-base sm:text-lg text-[#6D6D6D] line-through font-sans-ui">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#1F5742] font-sans-ui">
                        {formatCurrency(product.salePrice)}
                      </span>
                      <span className="text-xs uppercase font-semibold bg-[#1F5742] text-white px-2.5 py-0.5 rounded-xs">
                        {language === 'fr' ? 'SOLDES' : 'SALE'}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-[#151515] font-sans-ui">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#6D6D6D] leading-relaxed font-sans-ui mt-3">
                {product.description}
              </p>

              {/* Color Swatch Selection */}
              {product.colors.length > 0 && (
                <div className="py-4 border-t border-[#E7E3DA] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#151515] font-sans-ui">
                      {language === 'fr' ? 'COULEUR :' : 'COLOR:'}{' '}
                      <span className="font-normal text-[#6D6D6D]">{selectedColor?.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor?.name === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-[#1F5742] border-white scale-110'
                              : 'border-black/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          aria-label={`Select ${color.name}`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="py-4 border-t border-[#E7E3DA] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#151515] font-sans-ui">
                    {language === 'fr' ? 'CHOISIR LA TAILLE :' : 'SELECT SIZE:'}{' '}
                    <span className="font-normal text-[#6D6D6D]">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/size-guide')}
                    className="text-[#1F5742] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{t('navSizeGuide')}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
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
                        className={`min-w-[46px] h-10 px-3 text-xs font-semibold rounded-xs border transition-transform active:scale-95 cursor-pointer ${
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
                  <p className="text-xs text-red-600 font-medium">
                    {language === 'fr' ? 'Veuillez sélectionner une taille.' : 'Please select a size to proceed.'}
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-xs font-semibold text-[#151515] font-sans-ui">
                  {language === 'fr' ? 'QUANTITÉ :' : 'QUANTITY:'}
                </span>
                <div className="flex items-center border border-[#E7E3DA] rounded bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-xs text-[#6D6D6D] hover:text-[#151515] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-semibold text-[#151515]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-xs text-[#6D6D6D] hover:text-[#151515] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dual Action Buttons: ADD TO CART & ORDER NOW (NO COD MENTION) */}
              <div className="space-y-3 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-4 bg-white border border-[#1F5742] hover:bg-[#F7F3EA] text-[#1F5742] text-xs font-semibold uppercase tracking-[0.14em] rounded-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('addToBag')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOrderNow}
                    className="w-full py-3.5 px-4 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-[0.14em] rounded-xs transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-[#E8A598]" />
                    <span>{t('orderNowPayOnDelivery')}</span>
                  </button>
                </div>

                {/* Algerian Payment on Delivery Trust Notice */}
                <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-3 rounded-xs flex items-center justify-between text-xs text-[#6D6D6D]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1F5742]" />
                    <span>
                      {language === 'fr'
                        ? 'Paiement à la livraison sur les 69 Wilayas'
                        : 'Payment on Delivery across 69 Wilayas'}
                    </span>
                  </div>
                  <span className="text-[#1F5742] font-semibold text-[11px]">
                    {language === 'fr' ? 'À la réception' : 'Pay on Arrival'}
                  </span>
                </div>
              </div>

              {/* Accordion Sections: Details, Size Guide, Shipping & Delivery */}
              <div className="pt-4 border-t border-[#E7E3DA] divide-y divide-[#E7E3DA]">
                {/* Accordion: Product Details */}
                <div className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('details')}
                    className="w-full flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#151515] hover:text-[#1F5742] cursor-pointer"
                  >
                    <span>{language === 'fr' ? 'DÉTAILS DU PRODUIT & TISSUS' : 'PRODUCT DETAILS & FABRIC'}</span>
                    {openAccordion === 'details' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {openAccordion === 'details' && (
                    <div className="pt-3 text-xs text-[#6D6D6D] space-y-2 leading-relaxed">
                      <ul className="list-disc pl-4 space-y-1">
                        {product.fabricDetails?.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                        <li>SKU: {product.sku}</li>
                      </ul>
                      <div className="pt-1">
                        <span className="font-semibold text-[#151515] block mb-1">
                          {language === 'fr' ? 'Conseils d’Entretien :' : 'Care Instructions:'}
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {product.careInstructions?.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion: Shipping & Delivery in Algeria (NO COD MENTION) */}
                <div className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('shipping')}
                    className="w-full flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#151515] hover:text-[#1F5742] cursor-pointer"
                  >
                    <span>
                      {language === 'fr'
                        ? 'LIVRAISON & PAIEMENT (69 WILAYAS)'
                        : 'SHIPPING & PAYMENT ON DELIVERY (69 WILAYAS)'}
                    </span>
                    {openAccordion === 'shipping' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {openAccordion === 'shipping' && (
                    <div className="pt-3 text-xs text-[#6D6D6D] space-y-2 leading-relaxed">
                      <p>
                        <strong>{language === 'fr' ? 'Paiement à la livraison :' : 'Payment on Delivery:'}</strong>{' '}
                        {language === 'fr'
                          ? 'Aucun paiement préalable ni carte bancaire n’est exigé. Vous réglez directement le livreur à la réception de votre colis.'
                          : 'No upfront payment or bank card is required. You pay cash to the courier agent upon parcel delivery.'}
                      </p>
                      <p>
                        <strong>{language === 'fr' ? 'Confirmation téléphonique :' : 'Telephone Verification:'}</strong>{' '}
                        {language === 'fr'
                          ? 'Notre équipe d’Alger vous appelle par téléphone pour valider vos mensurations et votre adresse avant expédition.'
                          : 'Our Alger customer care team contacts you by phone to confirm your exact measurements and delivery address prior to courier dispatch.'}
                      </p>
                      <p>
                        <strong>{language === 'fr' ? 'Délais de livraison :' : 'Estimated Delivery:'}</strong>{' '}
                        {language === 'fr'
                          ? '24 à 48h pour Alger et wilayas centrales ; 2 à 4 jours pour les wilayas de l’intérieur et du Grand Sud.'
                          : '24–48 hours for Algiers and Central wilayas; 2–4 days for regional hubs and Southern wilayas.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#E7E3DA]">
            <AnimatedReveal animation="blur-reveal" delay={0.1}>
              <div className="text-center mb-10 space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-[#1F5742] font-semibold font-sans-ui">
                  {language === 'fr' ? 'PIÈCES ASSORTIES' : 'COMPLEMENTARY PIECES'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-editorial font-normal text-[#151515]">
                  {language === 'fr' ? 'VOUS AIMEREZ AUSSI' : 'YOU MAY ALSO LIKE'}
                </h2>
              </div>
            </AnimatedReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p, idx) => (
                <AnimatedReveal key={p.id} animation="soft-rise" delay={0.1 + idx * 0.08}>
                  <ProductCard product={p} />
                </AnimatedReveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
