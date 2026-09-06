import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../services/shippingService';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigate, language, t, products } = useShop();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? products.filter((p) => {
        return (
          p.name.toLowerCase().includes(trimmed) ||
          p.categoryLabel.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.sku.toLowerCase().includes(trimmed)
        );
      })
    : [];

  const handleSelectProduct = (slug: string) => {
    setIsSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
  };

  const popularTags =
    language === 'fr'
      ? ['Combinaison', 'Chemise Lin', 'Robe de Soirée', 'Tailleur Blazer', 'Cardigan Mérinos', 'Ensemble Lin']
      : ['Jumpsuit', 'Linen Shirt', 'Evening Dress', 'Tailored Blazer', 'Merino Cardigan', 'Co-Ord Set'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex flex-col justify-start">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsSearchOpen(false)}
        />

        {/* Top Search Panel */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full bg-[#FCFBF7] border-b border-[#E7E3DA] shadow-xl z-10 pt-6 pb-8 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header & Input */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative grow flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-[#1F5742]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-[#F7F3EA] border border-[#E7E3DA] rounded-xs pl-11 pr-10 py-3.5 text-sm sm:text-base text-[#151515] placeholder-[#6D6D6D] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 p-1 text-[#6D6D6D] hover:text-[#151515]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 text-[#6D6D6D] hover:text-[#151515] hover:bg-[#F7F3EA] rounded-full transition-colors"
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Suggestions when empty */}
            {!trimmed && (
              <div className="space-y-3">
                <span className="text-[11px] font-sans-ui uppercase tracking-wider text-[#6D6D6D] block">
                  {language === 'fr' ? 'Recherches Fréquentes :' : 'Popular Searches:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTag(tag)}
                      className="text-xs px-3 py-1.5 rounded bg-[#F7F3EA] hover:bg-[#1F5742] hover:text-white text-[#151515] transition-colors border border-[#E7E3DA]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            {trimmed && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#6D6D6D] border-b border-[#E7E3DA] pb-2">
                  <span>
                    {language === 'fr'
                      ? `${results.length} résultat(s) trouvé(s) pour « ${query} »`
                      : `Found ${results.length} item(s) matching “${query}”`}
                  </span>
                </div>

                {results.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-base font-editorial text-[#151515]">
                      {language === 'fr' ? 'AUCUN ARTICLE TROUVÉ' : 'NO PRODUCTS FOUND'}
                    </p>
                    <p className="text-xs text-[#6D6D6D]">
                      {language === 'fr'
                        ? 'Essayez un autre mot-clé ou parcourez nos catégories.'
                        : 'We couldn’t find anything matching your search term. Try another keyword.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                    {results.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="group flex gap-3 p-2.5 rounded bg-white hover:bg-[#F7F3EA] border border-[#E7E3DA] cursor-pointer transition-colors"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-20 object-cover rounded bg-[#F7F3EA] shrink-0"
                        />
                        <div className="grow flex flex-col justify-center">
                          <span className="text-[10px] uppercase tracking-wider text-[#6D6D6D]">
                            {product.categoryLabel}
                          </span>
                          <h4 className="text-xs font-semibold text-[#151515] group-hover:text-[#1F5742] transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="mt-1 flex items-baseline gap-1.5">
                            {product.salePrice ? (
                              <>
                                <span className="text-[11px] text-[#6D6D6D] line-through">
                                  {formatCurrency(product.price)}
                                </span>
                                <span className="text-xs font-semibold text-[#1F5742]">
                                  {formatCurrency(product.salePrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-[#151515]">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#6D6D6D] group-hover:text-[#1F5742] self-center mr-1" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
