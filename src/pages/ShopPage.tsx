import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { AnimatedReveal } from '../components/AnimatedReveal';
import { ProductCategory } from '../types';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: ProductCategory;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory = 'all' }) => {
  const { currentPath, navigate, language, t, products, categories: dbCategories } = useShop();

  // Determine active category from path or prop
  const currentCategory: ProductCategory = useMemo(() => {
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '') as ProductCategory;
      return slug;
    }
    return initialCategory;
  }, [currentPath, initialCategory]);

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(currentCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [showOnlySale, setShowOnlySale] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync if path changes
  React.useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  // Static pill definitions double as the offline fallback. When the
  // database categories load, enabled ones (same slugs) take over.
  const staticCategories: { key: ProductCategory; labelEn: string; labelFr: string }[] = [
    { key: 'all', labelEn: 'ALL', labelFr: 'TOUT' },
    { key: 'women', labelEn: 'WOMEN', labelFr: 'FEMMES' },
    { key: 'men', labelEn: 'MEN', labelFr: 'HOMMES' },
    { key: 'dresses', labelEn: 'DRESSES', labelFr: 'ROBES' },
    { key: 'tops', labelEn: 'TOPS', labelFr: 'HAUTS' },
    { key: 'bottoms', labelEn: 'BOTTOMS', labelFr: 'PANTALONS' },
    { key: 'sets', labelEn: 'SETS', labelFr: 'ENSEMBLES' },
    { key: 'accessories', labelEn: 'ACCESSORIES', labelFr: 'ACCESSOIRES' },
    { key: 'new-arrivals', labelEn: 'NEW ARRIVALS', labelFr: 'NOUVEAUTÉS' },
    { key: 'sale', labelEn: 'SALE', labelFr: 'SOLDES' },
  ];

  const categories: { key: ProductCategory; labelEn: string; labelFr: string }[] = useMemo(() => {
    const enabled = dbCategories.filter((c) => c.enabled);
    if (enabled.length === 0) return staticCategories;
    const pills = enabled.map((c) => ({
      key: c.slug as ProductCategory,
      labelEn: c.name.toUpperCase(),
      labelFr: (c.nameFr || c.name).toUpperCase(),
    }));
    return [{ key: 'all' as ProductCategory, labelEn: 'ALL', labelFr: 'TOUT' }, ...pills];
  }, [dbCategories]);

  const filteredProducts = useMemo(() => {
    // Single source of truth: the CMS/database-backed catalog from context.
    // Never the hardcoded static array — Admin edits must appear here.
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'sale') {
        list = list.filter((p) => p.isSale);
      } else if (selectedCategory === 'new-arrivals') {
        list = list.filter((p) => p.isNew);
      } else {
        list = list.filter((p) => p.category === selectedCategory);
      }
    }

    // Sale toggle
    if (showOnlySale && selectedCategory !== 'sale') {
      list = list.filter((p) => p.isSale);
    }

    // Price filter
    list = list.filter((p) => {
      const effectivePrice = p.salePrice ?? p.price;
      return effectivePrice <= maxPrice;
    });

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else {
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, sortBy, maxPrice, showOnlySale]);

  const handleCategoryClick = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      navigate('/shop');
    } else {
      navigate(`/category/${cat}`);
    }
  };

  const getPageTitle = () => {
    if (selectedCategory === 'all') return language === 'fr' ? 'TOUTE LA COLLECTION' : 'SHOP ALL';
    if (selectedCategory === 'sale') return t('theSaleEdit');
    const matched = categories.find((c) => c.key === selectedCategory);
    return language === 'fr' ? matched?.labelFr || selectedCategory : matched?.labelEn || selectedCategory;
  };

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Breadcrumb */}
        <AnimatedReveal animation="blur-reveal" delay={0.05}>
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] font-sans-ui uppercase tracking-[0.25em] text-[#1F5742] font-semibold">
              {language === 'fr' ? 'CATALOGUE ATLAS' : 'ATLAS COLLECTION'}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-normal text-[#151515]">
              {getPageTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-[#6D6D6D]">
              {language === 'fr'
                ? 'Mode contemporaine confectionnée avec élégance, avec paiement à la livraison sur les 69 wilayas.'
                : 'Contemporary fashion tailored with timeless elegance and payment on delivery across 69 wilayas.'}
            </p>
          </div>
        </AnimatedReveal>

        {/* Category Pills Bar (Horizontal Scrollable) */}
        <AnimatedReveal animation="soft-rise" delay={0.1}>
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 py-3 border-y border-[#E7E3DA] mb-8">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const label = language === 'fr' ? cat.labelFr : cat.labelEn;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`text-xs font-sans-ui uppercase tracking-[0.14em] px-4 py-2 rounded-xs whitespace-nowrap transition-transform active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F5742] text-white font-semibold'
                      : 'bg-[#F7F3EA] text-[#151515] hover:bg-[#E7E3DA]'
                  } ${cat.key === 'sale' && !isSelected ? 'text-[#E8A598] font-medium' : ''}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </AnimatedReveal>

        {/* Toolbar: Filters, Counts & Sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-xs text-[#6D6D6D] pb-4 border-b border-[#E7E3DA]">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F3EA] border border-[#E7E3DA] text-[#151515] rounded-xs font-medium hover:bg-[#E7E3DA] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F5742]" />
              <span>{t('filter')}</span>
            </button>

            <span>
              {language === 'fr' ? (
                <>
                  Affichage de <strong className="text-[#151515]">{filteredProducts.length}</strong> articles
                </>
              ) : (
                <>
                  Showing <strong className="text-[#151515]">{filteredProducts.length}</strong> items
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#1F5742]" />
            <span className="font-medium text-[#151515]">{t('sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F7F3EA] border border-[#E7E3DA] rounded-xs px-2.5 py-1.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742]"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="newest">{t('sortNewest')}</option>
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
            </select>
          </div>
        </div>

        {/* Filter Drawer / Accordion Bar */}
        {isFilterDrawerOpen && (
          <AnimatedReveal animation="soft-rise" delay={0.05} className="mb-8 p-6 bg-[#F7F3EA] border border-[#E7E3DA] rounded-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E3DA] pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1F5742]">
                {language === 'fr' ? 'Affiner la Sélection' : 'Refine Selection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-[#6D6D6D] hover:text-[#151515] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block font-semibold text-[#151515] mb-2">
                  {language === 'fr' ? 'Prix Maximum :' : 'Max Price:'}{' '}
                  <span className="text-[#1F5742]">{maxPrice.toLocaleString()} DA</span>
                </label>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1F5742]"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 sm:pt-0">
                <input
                  type="checkbox"
                  id="sale-only"
                  checked={showOnlySale}
                  onChange={(e) => setShowOnlySale(e.target.checked)}
                  className="accent-[#1F5742] w-4 h-4 rounded"
                />
                <label htmlFor="sale-only" className="font-semibold text-[#151515] cursor-pointer">
                  {language === 'fr' ? 'Articles en solde uniquement' : 'Show discounted items only'}
                </label>
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMaxPrice(15000);
                    setShowOnlySale(false);
                    setSelectedCategory('all');
                  }}
                  className="text-xs text-[#6D6D6D] hover:text-[#1F5742] underline cursor-pointer"
                >
                  {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset All Filters'}
                </button>
              </div>
            </div>
          </AnimatedReveal>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E7E3DA] rounded-xs space-y-3">
            <h3 className="text-xl font-editorial text-[#151515]">
              {language === 'fr' ? 'AUCUN ARTICLE TROUVÉ' : 'NO PRODUCTS FOUND'}
            </h3>
            <p className="text-xs text-[#6D6D6D] max-w-sm mx-auto">
              {language === 'fr'
                ? 'Aucun article ne correspond à vos filtres actuels. Modifiez le prix ou la catégorie.'
                : 'No products match your active filter criteria. Try adjusting your price or category filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setMaxPrice(15000);
                setShowOnlySale(false);
              }}
              className="px-6 py-2.5 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Voir Tous les Articles' : 'Show All Products'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product, idx) => (
              <AnimatedReveal
                key={product.id}
                animation={idx % 2 === 0 ? 'soft-rise' : 'scale-spring'}
                delay={Math.min(0.4, (idx % 4) * 0.08)}
              >
                <ProductCard product={product} />
              </AnimatedReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
