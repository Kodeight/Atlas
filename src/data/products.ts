import { Product } from '../types';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'p-1',
    name: 'Floral Summer Jumpsuit',
    slug: 'floral-summer-jumpsuit',
    category: 'dresses',
    categoryLabel: "Women's Clothing",
    shortDescription: 'Breezy botanical print jumpsuit in woven viscose with an adjustable tie waist.',
    description: 'Designed for effortless summer poise, the Floral Summer Jumpsuit combines a delicate botanical motif with fluid draping. Features a subtle V-neckline, waist cinch sash, side slash pockets, and relaxed wide legs tailored for all-day comfort.',
    price: 6000,
    salePrice: 4900,
    isSale: true,
    isFeatured: true,
    isNew: true,
    stock: 14,
    sku: 'ATL-JMP-001',
    rating: 4.9,
    reviewsCount: 28,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeOptions: [
      { size: 'XS', inStock: true, stockCount: 2 },
      { size: 'S', inStock: true, stockCount: 5 },
      { size: 'M', inStock: true, stockCount: 4 },
      { size: 'L', inStock: true, stockCount: 3 },
      { size: 'XL', inStock: false, stockCount: 0 },
    ],
    colors: [
      { name: 'Rose Pink', hex: '#E8A598', imageIndex: 0 },
      { name: 'Noir Black', hex: '#1C1C1C', imageIndex: 0 },
      { name: 'Mediterranean Blue', hex: '#3B6E8C', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Breathable Eco-Viscose', 'Unlined lightweight drape', 'Concealed back zip'],
    careInstructions: ['Hand wash cold or gentle machine wash 30°C', 'Do not tumble dry', 'Iron low temperature inside-out'],
  },
  {
    id: 'p-2',
    name: 'Oversized Linen Shirt',
    slug: 'oversized-linen-shirt',
    category: 'tops',
    categoryLabel: 'Tops & Shirts',
    shortDescription: 'Pure European flax linen shirt with a relaxed dropped-shoulder silhouette.',
    description: 'An enduring Atlas classic. Tailored from pre-washed pure linen for soft, lived-in texture. Detailed with natural shell buttons, curved high-low hemline, and chest patch pocket.',
    price: 5200,
    salePrice: 4200,
    isSale: true,
    isFeatured: true,
    isNew: false,
    stock: 22,
    sku: 'ATL-SHR-002',
    rating: 4.8,
    reviewsCount: 34,
    sizes: ['S', 'M', 'L', 'XL'],
    sizeOptions: [
      { size: 'S', inStock: true, stockCount: 6 },
      { size: 'M', inStock: true, stockCount: 8 },
      { size: 'L', inStock: true, stockCount: 5 },
      { size: 'XL', inStock: true, stockCount: 3 },
    ],
    colors: [
      { name: 'Natural Sand', hex: '#E4DDD2', imageIndex: 0 },
      { name: 'Atlas Forest', hex: '#1F5742', imageIndex: 0 },
      { name: 'Crisp White', hex: '#FFFFFF', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Washed Linen', 'Corozo nut buttons', 'French seam finishing'],
    careInstructions: ['Gentle cycle cold', 'Hang dry in shade', 'Warm steam iron while damp'],
  },
  {
    id: 'p-3',
    name: 'Satin Pleated Evening Dress',
    slug: 'satin-pleated-evening-dress',
    category: 'dresses',
    categoryLabel: "Women's Evening",
    shortDescription: 'Lustrous emerald satin maxi dress featuring fine sunburst accordion pleats.',
    description: 'A striking statement piece designed for festive Algerian evenings and celebrations. Boasting accordion micro-pleating that ripples with every movement, refined halter neckline, and an ankle-grazing fluid silhouette.',
    price: 8900,
    salePrice: 7500,
    isSale: true,
    isFeatured: true,
    isNew: true,
    stock: 9,
    sku: 'ATL-DRS-003',
    rating: 5.0,
    reviewsCount: 19,
    sizes: ['36', '38', '40', '42', '44'],
    sizeOptions: [
      { size: '36', inStock: true, stockCount: 2 },
      { size: '38', inStock: true, stockCount: 3 },
      { size: '40', inStock: true, stockCount: 3 },
      { size: '42', inStock: true, stockCount: 1 },
      { size: '44', inStock: false, stockCount: 0 },
    ],
    colors: [
      { name: 'Atlas Emerald', hex: '#1F5742', imageIndex: 0 },
      { name: 'Champagne Gold', hex: '#D6BA8E', imageIndex: 0 },
      { name: 'Midnight Onyx', hex: '#111317', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['97% Silk-finish Satin Viscose, 3% Elastane', 'Permanent heat-set pleats', 'Fully lined'],
    careInstructions: ['Dry clean recommended', 'Steam only at low setting', 'Store hanging'],
  },
  {
    id: 'p-4',
    name: 'Relaxed Tailored Blazer',
    slug: 'relaxed-tailored-blazer',
    category: 'tops',
    categoryLabel: 'Outerwear',
    shortDescription: 'Single-breasted fluid wool-blend blazer with structured lapels and clean welt pockets.',
    description: 'The definitive transitional blazer. Crafted with soft shoulder pads, notched lapels, horn-tone buttons, and interior piped seams. Pairs effortlessly with matching trousers or casual denim.',
    price: 9500,
    salePrice: undefined,
    isSale: false,
    isFeatured: true,
    isNew: true,
    stock: 16,
    sku: 'ATL-BLZ-004',
    rating: 4.9,
    reviewsCount: 41,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeOptions: [
      { size: 'XS', inStock: true, stockCount: 3 },
      { size: 'S', inStock: true, stockCount: 5 },
      { size: 'M', inStock: true, stockCount: 4 },
      { size: 'L', inStock: true, stockCount: 3 },
      { size: 'XL', inStock: true, stockCount: 1 },
    ],
    colors: [
      { name: 'Warm Taupe', hex: '#B8A89A', imageIndex: 0 },
      { name: 'Deep Evergreen', hex: '#163C2E', imageIndex: 0 },
      { name: 'Soft Cream', hex: '#F3EFE6', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['65% Fine Wool, 30% Lyocell, 5% Spandex', '100% Cupro lining', 'Double back vent'],
    careInstructions: ['Dry clean only', 'Do not bleach', 'Warm iron over press cloth'],
  },
  {
    id: 'p-5',
    name: 'Wide-Leg Pleated Trousers',
    slug: 'wide-leg-pleated-trousers',
    category: 'bottoms',
    categoryLabel: 'Trousers & Bottoms',
    shortDescription: 'High-waisted tailored trousers with sharp front pleats and fluid wide legs.',
    description: 'Impeccable tailoring meets contemporary volume. Featuring double pleats at the waistband, slanted front pockets, back welt pockets, and a neat extended tab closure.',
    price: 5800,
    salePrice: 4800,
    isSale: true,
    isFeatured: false,
    isNew: true,
    stock: 18,
    sku: 'ATL-TRS-005',
    rating: 4.8,
    reviewsCount: 22,
    sizes: ['36', '38', '40', '42', '44'],
    sizeOptions: [
      { size: '36', inStock: true, stockCount: 4 },
      { size: '38', inStock: true, stockCount: 5 },
      { size: '40', inStock: true, stockCount: 4 },
      { size: '42', inStock: true, stockCount: 3 },
      { size: '44', inStock: true, stockCount: 2 },
    ],
    colors: [
      { name: 'Soft Beige', hex: '#D8CFBC', imageIndex: 0 },
      { name: 'Charcoal Grey', hex: '#373A3C', imageIndex: 0 },
      { name: 'Forest Green', hex: '#1F5742', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['Polyester-Rayon twill weave', 'Mid-weight drape', 'Internal waistband stay'],
    careInstructions: ['Machine wash 30°C delicate', 'Line dry', 'Cool iron'],
  },
  {
    id: 'p-6',
    name: 'Casual Summer Co-Ord Set',
    slug: 'casual-summer-co-ord-set',
    category: 'sets',
    categoryLabel: 'Matching Sets',
    shortDescription: 'Relaxed two-piece short-sleeve shirt and matching drawstring palazzo pants.',
    description: 'The ultimate warm-weather set. Made from crinkle cotton gauze that breathes in Algerian summers. Can be worn together as an effortless editorial ensemble or styled separately with your wardrobe staples.',
    price: 7200,
    salePrice: 5900,
    isSale: true,
    isFeatured: true,
    isNew: true,
    stock: 12,
    sku: 'ATL-SET-006',
    rating: 4.9,
    reviewsCount: 31,
    sizes: ['S', 'M', 'L', 'XL'],
    sizeOptions: [
      { size: 'S', inStock: true, stockCount: 3 },
      { size: 'M', inStock: true, stockCount: 4 },
      { size: 'L', inStock: true, stockCount: 3 },
      { size: 'XL', inStock: true, stockCount: 2 },
    ],
    colors: [
      { name: 'Sage Mint', hex: '#A3B899', imageIndex: 0 },
      { name: 'Terracotta Earth', hex: '#C26D53', imageIndex: 0 },
      { name: 'Vanilla Cream', hex: '#F6F1E5', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Crinkle Organic Cotton', 'Elastic waistband with self-fabric tie', 'Coconut shell buttons'],
    careInstructions: ['Wash cold inside-out', 'Lay flat to dry to preserve texture', 'Steam gently if needed'],
  },
  {
    id: 'p-7',
    name: 'Classic Cotton Crewneck T-Shirt',
    slug: 'classic-cotton-crewneck-tshirt',
    category: 'men',
    categoryLabel: "Men's Collection",
    shortDescription: 'Heavyweight 240 GSM combed cotton tee with ribbed collar and relaxed drape.',
    description: 'Substantial, durable, and refined. Woven from long-staple combed cotton with reinforced twin-needle stitching at the neckline and cuffs. Retains its tailored fit wash after wash.',
    price: 3200,
    salePrice: 2500,
    isSale: true,
    isFeatured: false,
    isNew: false,
    stock: 35,
    sku: 'ATL-TEE-007',
    rating: 4.7,
    reviewsCount: 52,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeOptions: [
      { size: 'S', inStock: true, stockCount: 8 },
      { size: 'M', inStock: true, stockCount: 12 },
      { size: 'L', inStock: true, stockCount: 9 },
      { size: 'XL', inStock: true, stockCount: 4 },
      { size: 'XXL', inStock: true, stockCount: 2 },
    ],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF', imageIndex: 0 },
      { name: 'Atlas Deep Green', hex: '#1F5742', imageIndex: 0 },
      { name: 'Washed Black', hex: '#262626', imageIndex: 0 },
    ],
    images: [
      '/crowneck.png',
    ],
    fabricDetails: ['100% Combed Compact Cotton', 'Pre-shrunk 240 GSM', 'Seamless tubular torso'],
    careInstructions: ['Machine wash 30°C', 'Do not tumble dry', 'Warm iron'],
  },
  {
    id: 'p-8',
    name: 'Men’s Relaxed Linen Cuban Shirt',
    slug: 'mens-relaxed-linen-cuban-shirt',
    category: 'men',
    categoryLabel: "Men's Collection",
    shortDescription: 'Camp collar breathable linen shirt with boxy fit and tonal horn buttons.',
    description: 'Crafted for sunny Mediterranean days. Features a vintage-inspired open camp collar, straight vented hemline, and breathable weave that keeps cool throughout Algerian summers.',
    price: 5400,
    salePrice: undefined,
    isSale: false,
    isFeatured: true,
    isNew: true,
    stock: 20,
    sku: 'ATL-MSH-008',
    rating: 4.9,
    reviewsCount: 18,
    sizes: ['M', 'L', 'XL', 'XXL'],
    sizeOptions: [
      { size: 'M', inStock: true, stockCount: 6 },
      { size: 'L', inStock: true, stockCount: 7 },
      { size: 'XL', inStock: true, stockCount: 5 },
      { size: 'XXL', inStock: true, stockCount: 2 },
    ],
    colors: [
      { name: 'Olive Moss', hex: '#6B705C', imageIndex: 0 },
      { name: 'Desert Dune', hex: '#DDBEA9', imageIndex: 0 },
      { name: 'Sky Ecru', hex: '#F0EFEB', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% French Normandy Linen', 'Camp collar with loop button', 'Side seam slits'],
    careInstructions: ['Wash gentle 30°C', 'Hang to dry', 'Steam iron'],
  },
  {
    id: 'p-9',
    name: 'Ribbed Knit Sleeveless Top',
    slug: 'ribbed-knit-sleeveless-top',
    category: 'tops',
    categoryLabel: 'Knitwear & Tops',
    shortDescription: 'Fine-gauge modal-cotton ribbed tank with a modern square neckline.',
    description: 'An essential layering staple. Woven in a fine 2x2 rib knit that hugs the body smoothly without cling. Perfect tucked into high-rise trousers or paired beneath the Relaxed Tailored Blazer.',
    price: 3600,
    salePrice: 2800,
    isSale: true,
    isFeatured: false,
    isNew: false,
    stock: 25,
    sku: 'ATL-TOP-009',
    rating: 4.8,
    reviewsCount: 19,
    sizes: ['XS', 'S', 'M', 'L'],
    sizeOptions: [
      { size: 'XS', inStock: true, stockCount: 4 },
      { size: 'S', inStock: true, stockCount: 8 },
      { size: 'M', inStock: true, stockCount: 9 },
      { size: 'L', inStock: true, stockCount: 4 },
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF7EE', imageIndex: 0 },
      { name: 'Mocha Brown', hex: '#634832', imageIndex: 0 },
      { name: 'Atlas Sage', hex: '#3B6B58', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['60% Modal, 35% Cotton, 5% Elastane', 'Wide non-binding straps', 'Double stitched hem'],
    careInstructions: ['Machine wash delicate', 'Do not wring', 'Dry flat'],
  },
  {
    id: 'p-10',
    name: 'Pleated A-Line Midi Skirt',
    slug: 'pleated-a-line-midi-skirt',
    category: 'bottoms',
    categoryLabel: 'Skirts',
    shortDescription: 'Knife-pleated fluid midi skirt with an invisible stretch waistband.',
    description: 'Cut from fluid Japanese twill that maintains sharp pleats through repeated wear. Designed to fall gracefully mid-calf with a gentle flared sweep as you walk.',
    price: 5900,
    salePrice: 4700,
    isSale: true,
    isFeatured: true,
    isNew: false,
    stock: 15,
    sku: 'ATL-SKT-010',
    rating: 4.9,
    reviewsCount: 26,
    sizes: ['36', '38', '40', '42'],
    sizeOptions: [
      { size: '36', inStock: true, stockCount: 3 },
      { size: '38', inStock: true, stockCount: 6 },
      { size: '40', inStock: true, stockCount: 4 },
      { size: '42', inStock: true, stockCount: 2 },
    ],
    colors: [
      { name: 'Oatmeal Heather', hex: '#D2CBBF', imageIndex: 0 },
      { name: 'Forest Emerald', hex: '#1F5742', imageIndex: 0 },
      { name: 'Midnight Blue', hex: '#1B263B', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Recycled Polyester Georgette', 'Concealed side zipper', 'Soft tricot interior slip'],
    careInstructions: ['Machine wash cold in laundry bag', 'Do not iron pleats directly', 'Steam vertically'],
  },
  {
    id: 'p-11',
    name: 'Silk Blend Wrap Maxi Dress',
    slug: 'silk-blend-wrap-maxi-dress',
    category: 'dresses',
    categoryLabel: "Women's Collection",
    shortDescription: 'True wrap silhouette in fluid silk-viscose blend with poet cuff sleeves.',
    description: 'Timeless elegance and universally flattering fit. Features a true wrap closure with deep internal tie, gentle blouson sleeves with mother-of-pearl button cuffs, and a cascading tiered hem.',
    price: 8500,
    salePrice: 6900,
    isSale: true,
    isFeatured: true,
    isNew: true,
    stock: 11,
    sku: 'ATL-WRP-011',
    rating: 5.0,
    reviewsCount: 38,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeOptions: [
      { size: 'XS', inStock: true, stockCount: 2 },
      { size: 'S', inStock: true, stockCount: 3 },
      { size: 'M', inStock: true, stockCount: 4 },
      { size: 'L', inStock: true, stockCount: 2 },
      { size: 'XL', inStock: false, stockCount: 0 },
    ],
    colors: [
      { name: 'Olive Ochre', hex: '#997B48', imageIndex: 0 },
      { name: 'Terracotta Rust', hex: '#A8523C', imageIndex: 0 },
      { name: 'Atlas Teal Green', hex: '#1F5742', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['30% Mulberry Silk, 70% Viscose Crepe', 'Generous self-tie belt', 'Bra-friendly modesty clasp'],
    careInstructions: ['Dry clean or gentle hand wash cold', 'Dry flat away from direct sun', 'Cool iron on reverse'],
  },
  {
    id: 'p-12',
    name: 'Structured Canvas Leather-Trim Tote',
    slug: 'structured-canvas-leather-trim-tote',
    category: 'accessories',
    categoryLabel: 'Bags & Accessories',
    shortDescription: 'Heavy natural cotton canvas tote with calfskin leather handles and gold-tone hardware.',
    description: 'An everyday luxury companion. Crafted from unbleached 18oz cotton canvas with smooth vegetal leather straps, zippered top closure, and a reinforced bottom base with metal feet.',
    price: 6800,
    salePrice: undefined,
    isSale: false,
    isFeatured: false,
    isNew: true,
    stock: 16,
    sku: 'ATL-BAG-012',
    rating: 4.9,
    reviewsCount: 15,
    sizes: ['ONE SIZE'],
    sizeOptions: [{ size: 'ONE SIZE', inStock: true, stockCount: 16 }],
    colors: [
      { name: 'Ecru & Chestnut', hex: '#8B5A2B', imageIndex: 0 },
      { name: 'Ecru & Atlas Green', hex: '#1F5742', imageIndex: 0 },
      { name: 'All Black Canvas', hex: '#1E1E1E', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Unbleached Heavy Cotton Canvas', 'Full-grain vegetal tanned leather trim', 'YKK metal zipper'],
    careInstructions: ['Spot clean canvas with mild soap', 'Condition leather with neutral balm', 'Store in dust bag'],
  },
  {
    id: 'p-13',
    name: 'Chunky Knit Merino Cardigan',
    slug: 'chunky-knit-merino-cardigan',
    category: 'tops',
    categoryLabel: 'Knitwear',
    shortDescription: 'Heavy-gauge fisherman rib cardigan knitted with soft Australian extra-fine merino wool.',
    description: 'Warmth without weight. Features a relaxed V-neck, dropped shoulders, substantial tortoiseshell buttons, and deep welt front pockets. Designed for cozy evenings in Algiers and Constantine.',
    price: 8900,
    salePrice: 7200,
    isSale: true,
    isFeatured: true,
    isNew: false,
    stock: 10,
    sku: 'ATL-KNT-013',
    rating: 4.9,
    reviewsCount: 23,
    sizes: ['S', 'M', 'L'],
    sizeOptions: [
      { size: 'S', inStock: true, stockCount: 3 },
      { size: 'M', inStock: true, stockCount: 5 },
      { size: 'L', inStock: true, stockCount: 2 },
    ],
    colors: [
      { name: 'Camel Tan', hex: '#C19A6B', imageIndex: 0 },
      { name: 'Pistachio Mist', hex: '#BFD8BD', imageIndex: 0 },
      { name: 'Winter Chalk', hex: '#F7F6F2', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['80% Merino Wool, 20% Recycled Polyamide', 'Ribbed cuffs and waistband', 'Natural horn buttons'],
    careInstructions: ['Hand wash cold with wool detergent', 'Do not tumble dry', 'Dry flat on towel'],
  },
  {
    id: 'p-14',
    name: 'Men’s Pleated Cotton Chinos',
    slug: 'mens-pleated-cotton-chinos',
    category: 'men',
    categoryLabel: "Men's Collection",
    shortDescription: 'Smart-casual garment-dyed cotton chinos with single pleats and tapered cuffs.',
    description: 'The modern gentleman’s trouser. Tailored with single forward pleats, comfortable mid-rise waist, horn button closure, and a refined taper towards the shoe.',
    price: 5600,
    salePrice: 4600,
    isSale: true,
    isFeatured: false,
    isNew: true,
    stock: 20,
    sku: 'ATL-MCH-014',
    rating: 4.8,
    reviewsCount: 16,
    sizes: ['40', '42', '44', '46'],
    sizeOptions: [
      { size: '40', inStock: true, stockCount: 4 },
      { size: '42', inStock: true, stockCount: 7 },
      { size: '44', inStock: true, stockCount: 6 },
      { size: '46', inStock: true, stockCount: 3 },
    ],
    colors: [
      { name: 'Khaki Beige', hex: '#C2B69D', imageIndex: 0 },
      { name: 'Navy Blue', hex: '#1D2A44', imageIndex: 0 },
      { name: 'Atlas Olive', hex: '#3E4F3E', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['98% Combed Cotton Twill, 2% Spandex', 'Garment washed for softness', 'YKK zip fly'],
    careInstructions: ['Wash cold inside out', 'Medium heat iron', 'Tumble dry low or line dry'],
  },
  {
    id: 'p-15',
    name: 'Silk Georgette Scarf & Hijab Edit',
    slug: 'silk-georgette-scarf-hijab-edit',
    category: 'accessories',
    categoryLabel: 'Scarves & Accessories',
    shortDescription: 'Generously proportioned pure silk georgette scarf with hand-rolled borders.',
    description: 'An elevated accessory featuring delicate non-slip texture and hand-finished rolled edges. Generously cut at 190cm x 75cm to provide elegant styling versatility for modest and contemporary wear alike.',
    price: 3400,
    salePrice: 2800,
    isSale: true,
    isFeatured: false,
    isNew: false,
    stock: 40,
    sku: 'ATL-SCF-015',
    rating: 4.9,
    reviewsCount: 44,
    sizes: ['ONE SIZE (190x75cm)'],
    sizeOptions: [{ size: 'ONE SIZE', inStock: true, stockCount: 40 }],
    colors: [
      { name: 'Atlas Heritage Green', hex: '#1F5742', imageIndex: 0 },
      { name: 'Dusty Rose', hex: '#DCAE9E', imageIndex: 0 },
      { name: 'Warm Champagne', hex: '#EBE2D5', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Silk Georgette', 'Hand-rolled hem stitches', 'Lightweight sheer drape'],
    careInstructions: ['Hand wash in cold water with delicate shampoo', 'Do not wring', 'Air dry flat in shade'],
  },
  {
    id: 'p-16',
    name: 'Double-Breasted Trench Coat',
    slug: 'double-breasted-trench-coat',
    category: 'women',
    categoryLabel: 'Coats & Outerwear',
    shortDescription: 'Water-repellent gabardine trench coat with raglan sleeves and D-ring belt.',
    description: 'The ultimate outerwear icon. Cut in sturdy cotton gabardine with shoulder storm flaps, horn buttons, deep storm collar, and a belted waist that cinches seamlessly over any outfit.',
    price: 11500,
    salePrice: 9800,
    isSale: true,
    isFeatured: true,
    isNew: true,
    stock: 8,
    sku: 'ATL-TRN-016',
    rating: 5.0,
    reviewsCount: 33,
    sizes: ['36', '38', '40', '42'],
    sizeOptions: [
      { size: '36', inStock: true, stockCount: 2 },
      { size: '38', inStock: true, stockCount: 3 },
      { size: '40', inStock: true, stockCount: 2 },
      { size: '42', inStock: true, stockCount: 1 },
    ],
    colors: [
      { name: 'Heritage Khaki', hex: '#C7B89E', imageIndex: 0 },
      { name: 'Dark Cypress Green', hex: '#1A4D3B', imageIndex: 0 },
      { name: 'Classic Black', hex: '#191919', imageIndex: 0 },
    ],
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
    ],
    fabricDetails: ['100% Water-resistant Cotton Gabardine', 'Full satin interior lining', 'Tortoiseshell buckle and buttons'],
    careInstructions: ['Specialist dry clean only', 'Keep water-repellent coating fresh with professional re-proofing'],
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return getActiveCatalog().find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return getActiveCatalog().find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  const catalog = getActiveCatalog();
  if (category === 'all') return catalog;
  if (category === 'sale') return catalog.filter((p) => p.isSale);
  if (category === 'new-arrivals') return catalog.filter((p) => p.isNew);
  return catalog.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return getActiveCatalog().filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  return getActiveCatalog().filter((p) => p.isNew).slice(0, 8);
}

export function getSaleProducts(): Product[] {
  return getActiveCatalog().filter((p) => p.isSale).slice(0, 8);
}

export function getBestSellers(): Product[] {
  return [...getActiveCatalog()].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 8);
}

export function getRelatedProducts(productId: string, category: string, limit = 4): Product[] {
  return getActiveCatalog()
    .filter((p) => p.id !== productId && (p.category === category || p.isFeatured))
    .slice(0, limit);
}

// CMS compatibility layer - preserves storefront integration while keeping build green
const ADMIN_API_BASE = '/admin/api';
let cmsProductsFetchAttempted = false;

export type StoreLanguage = 'en' | 'fr';

function pickLang(en: any, fr: any, lang: StoreLanguage): any {
  if (lang === 'fr' && typeof fr === 'string' && fr.trim().length > 0) return fr;
  return en;
}

function mapAdminProductToStorefront(adminProd: any, lang: StoreLanguage = 'en'): Product {
  const { id, name, description, price, image, stock, color } = adminProd;
  const displayName = pickLang(name, adminProd.nameFr, lang);
  const displayDescription = pickLang(description, adminProd.descriptionFr, lang);
  const displayFlavor = pickLang(adminProd.flavor, adminProd.flavorFr, lang);
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  // Relations (colors / sizes / gallery images) when the CMS provides them,
  // otherwise the legacy single-value fallbacks keep old products working.
  const relColors: any[] = Array.isArray(adminProd.colors) ? adminProd.colors : [];
  const relSizes: any[] = Array.isArray(adminProd.sizes) ? adminProd.sizes : [];
  const relImages: any[] = Array.isArray(adminProd.images) ? adminProd.images : [];
  const galleryEnabled = adminProd.galleryEnabled === true && relImages.length > 0;
  const galleryUrls = relImages.map((g) => g.url).filter((u) => typeof u === 'string' && u.length > 0);
  const allImages = galleryEnabled ? [image, ...galleryUrls].filter(Boolean) : undefined;
  const colorNameById = new Map<string, string>();
  for (const c of relColors) {
    if (c && c.id) colorNameById.set(c.id, pickLang(c.name, c.nameFr, lang) || c.name);
  }
  let category: Product['category'] = 'women';
  const nameLower = name.toLowerCase();
  if (/blazer|jacket|coat|outerwear/i.test(nameLower)) category = 'tops';
  else if (/shirt|top|tshirt|tee|blouse/i.test(nameLower)) category = 'tops';
  else if (/trouser|pants|bottom|skirt|shorts/i.test(nameLower)) category = 'bottoms';
  else if (/dress|gown|evening/i.test(nameLower)) category = 'dresses';
  else if (/set|co-ord|matching/i.test(nameLower)) category = 'sets';
  else if (/accessory|bag|scarf|hijab|hat/i.test(nameLower)) category = 'accessories';
  else if (/new|arrival|latest/i.test(nameLower)) category = 'new-arrivals';
  else if (/sale|discount|promo/i.test(nameLower)) category = 'sale';
  let colors: { name: string; hex: string; imageIndex?: number }[] = [];
  if (relColors.length > 0) {
    colors = relColors.map((c) => {
      const entry: { name: string; hex: string; imageIndex?: number } = {
        name: pickLang(c.name, c.nameFr, lang) || c.name,
        hex: typeof c.hex === 'string' && c.hex ? c.hex : '#1F5742',
      };
      const galleryIdx = relImages.findIndex((g) => g.colorId && g.colorId === c.id);
      if (galleryEnabled && galleryIdx >= 0) entry.imageIndex = 1 + galleryIdx;
      return entry;
    });
  } else if (color) {
    const colorName = color.replace('hsl(', '').replace(')', '').split(',')[0] || 'Default';
    colors = [{ name: colorName, hex: '#1F5742', imageIndex: 0 }];
  } else if (displayFlavor) {
    colors = [{ name: displayFlavor, hex: '#1F5742', imageIndex: 0 }];
  } else {
    colors = [{ name: 'Default', hex: '#1F5742', imageIndex: 0 }];
  }
  const enabledSizes = relSizes.filter((s) => s && s.enabled !== false && typeof s.label === 'string');
  const sizes = relSizes.length > 0 ? enabledSizes.map((s) => s.label) : ['S', 'M', 'L'];
  const sizeOptions =
    relSizes.length > 0
      ? relSizes.map((s) => ({
          size: s.label,
          inStock: s.enabled !== false && (s.stock == null || s.stock > 0),
          stockCount: typeof s.stock === 'number' ? s.stock : undefined,
        }))
      : undefined;
  const gallery =
    galleryEnabled
      ? relImages.map((g) => ({
          url: g.url,
          alt: typeof g.alt === 'string' ? g.alt : undefined,
          colorName: g.colorId ? colorNameById.get(g.colorId) : undefined,
        }))
      : undefined;
  const primaryImage = image ? image : '/placeholder-product.webp';
  return {
    id,
    name: displayName,
    slug,
    description: displayDescription,
    shortDescription: displayDescription ? displayDescription.split('.')[0] + '.' : displayName,
    galleryEnabled,
    gallery,
    category,
    categoryLabel: category,
    price,
    salePrice: undefined,
    images: allImages && allImages.length > 0 ? allImages : [primaryImage],
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L'],
    sizeOptions,
    colors,
    stock,
    sku: `ATL-${id.split('-')[1] || id}`,
    isSale: false,
    isFeatured: false,
    isNew: false,
    rating: 4.5,
    reviewsCount: 0,
    fabricDetails: undefined,
    careInstructions: undefined,
  };
}

export function mapAdminProductsToStorefront(adminProds: any[], lang: StoreLanguage = 'en'): Product[] {
  return adminProds.map((p) => mapAdminProductToStorefront(p, lang));
}

let cachedDbProducts: Product[] | null = null;

export async function fetchProductsFromCMS(lang: StoreLanguage = 'en'): Promise<Product[]> {
  try {
    const response = await fetch(`${ADMIN_API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products from CMS');
    const adminProducts: any[] = await response.json();
    cmsProductsFetchAttempted = true;
    const mapped = mapAdminProductsToStorefront(adminProducts, lang);
    if (mapped.length > 0) cachedDbProducts = mapped;
    return mapped.length > 0 ? mapped : PRODUCTS_DATA;
  } catch {
    cmsProductsFetchAttempted = true;
    return PRODUCTS_DATA;
  }
}

export function hasFetchedFromCMS(): boolean {
  return cmsProductsFetchAttempted;
}

export function getAllAtlasProductsFallback(): Product[] {
  return PRODUCTS_DATA;
}

export function setCachedProducts(products: Product[]) {
  cachedDbProducts = products;
}

function getActiveCatalog(): Product[] {
  if (cachedDbProducts && cachedDbProducts.length > 0) return cachedDbProducts;
  return PRODUCTS_DATA;
}
