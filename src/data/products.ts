import { Product } from './types';

// Admin backend API base path (mounted at /admin/api by Vite plugin)
const ADMIN_API_BASE = '/admin/api';

// Track if we've attempted to fetch from CMS
let cmsProductsFetchAttempted = false;

/**
 * Map an admin product (from CMS/database) to a storefront format.
 * Ensures the CMS is the source of truth and the storefront displays
 * products from the same data source.
 */
function mapAdminProductToStorefront(adminProd: any): Product {
  const { id, name, description, price, image, stock, color, bgGradient } = adminProd;

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Determine category from product name
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

  // Map color from admin format to storefront format
  let colors: { name: string; hex: string; imageIndex?: number }[] = [];
  if (color) {
    const colorName = color.replace('hsl(', '').replace(')', '').split(',')[0] || 'Default';
    colors = [{ name: colorName, hex: '#1F5742', imageIndex: 0 }];
  } else {
    colors = [{ name: 'Default', hex: '#1F5742', imageIndex: 0 }];
  }

  // Set default sale price (no sale by default)
  const salePrice = undefined;

  // Build image array - use the admin image as primary
  const primaryImage = image ? image : '/placeholder-product.webp';
  const images: string[] = [primaryImage];

  // Set default featured/sale status
  const isFeatured = false;
  const isSale = false;

  // Set default rating and reviews
  const rating = 4.5;
  const reviewsCount = 0;

  // Build short description
  const shortDescription = description ? description.split('.')[0] + '.' : name;

  // Determine SKU
  const sku = `ATL-${id.split('-')[1] || id}`;

  // Determine sizes - use reasonable defaults
  let sizes: string[] = ['S', 'M', 'L'];
  if (/blazer|jacket|coat|trouser|pants|shirt|dress|tunic|maxi|mini|skirt/i.test(name.toLowerCase())) {
    // Sizes would be more specific per product type
  }

  return {
    id,
    name,
    slug,
    description,
    shortDescription,
    category,
    price,
    salePrice,
    images,
    sizes,
    colors,
    stock,
    sku,
    isSale,
    isFeatured,
    isNew: false,
    rating,
    reviewsCount,
    fabricDetails: undefined,
    careInstructions: undefined,
  };
}

/**
 * Fetch products from the CMS/backend database.
 * Returns mapped storefront-format products, or falls back to Atlas static data.
 */
export async function fetchProductsFromCMS(): Promise<Product[]> {
  try {
    const response = await fetch(`${ADMIN_API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products from CMS');

    const adminProducts: any[] = await response.json();
    const storefrontProducts = mapAdminProductsToStorefront(adminProducts);
    
    // Mark that we've fetched from CMS
    cmsProductsFetchAttempted = true;
    
    return storefrontProducts;
  } catch (error) {
    console.warn('Could not fetch from CMS, using static Atlas data:', error);
    cmsProductsFetchAttempted = true;
    return getAllAtlasProductsFallback();
  }
}

/**
 * Map an array of admin products to storefront format.
 */
export function mapAdminProductsToStorefront(adminProds: any[]): Product[] {
  return adminProds.map(mapAdminProductToStorefront);
}

/**
 * Get all Atlas products (static fallback).
 */
export function getAllAtlasProductsFallback(): Product[] {
  // These would normally be imported, but we need to avoid circular deps
  // Return minimal Atlas products for fallback
  return [
    {
      id: 'atl-blz-004',
      name: 'Relaxed Tailored Blazer',
      slug: 'relaxed-tailored-blazer',
      category: 'tops',
      categoryLabel: 'Outerwear',
      price: 9500,
      stock: 16,
      colors: [{ name: 'Warm Taupe', hex: '#B8A89A' }],
      images: ['/blazer-front.webp'],
    },
    {
      id: 'atl-tee-007',
      name: 'Classic Cotton Crewneck T-Shirt',
      slug: 'classic-cotton-crewneck-tshirt',
      category: 'men',
      price: 3200,
      stock: 35,
      colors: [{ name: 'Pure White', hex: '#FFFFFF' }],
      images: ['/crowneck.png'],
    },
  ];
}

/**
 * Check if products have been fetched from the CMS.
 */
export function hasFetchedFromCMS(): boolean {
  return cmsProductsFetchAttempted;
}