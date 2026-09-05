import { Product } from '../types';

/**
 * Map an admin product (from CMS/database) to a storefront product format.
 * This ensures the CMS is the source of truth and the storefront displays
 * products from the same data source.
 */
export function mapAdminProductToStorefront(adminProd: any): Product {
  const { id, name, description, price, image, stock, color, bgGradient } = adminProd;

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Determine category from product name
  let category: 'women' | 'men' | 'dresses' | 'tops' | 'bottoms' | 'sets' | 'accessories' | 'new-arrivals' | 'sale' = 'women';
  const nameLower = name.toLowerCase();
  if (/blazer|jacket|coat|outerwear/i.test(nameLower)) category = 'tops';
  else if (/shirt|top|tshirt|tee|blouse/i.test(nameLower) || /shirt|blouse/i.test(nameLower)) category = 'tops';
  else if (/trouser|pants|bottom|skirt|shorts/i.test(nameLower)) category = 'bottoms';
  else if (/dress|gown|evening/i.test(nameLower)) category = 'dresses';
  else if (/set|co-ord|matching/i.test(nameLower)) category = 'sets';
  else if (/accessory|bag|scarf|hijab|hat/i.test(nameLower)) category = 'accessories';
  else if (/new|arrival|latest/i.test(nameLower)) category = 'new-arrivals';
  else if (/sale|discount|promo/i.test(nameLower)) category = 'sale';

  // Map color from admin format to storefront format
  let colors: { name: string; hex: string; imageIndex?: number }[] = [];
  if (color) {
    colors = [{ name: color.replace('hsl(', '').replace(')', '').split(',')[0] || 'Default', hex: '#1F5742', imageIndex: 0 }];
  } else {
    colors = [{ name: 'Default', hex: '#1F5742', imageIndex: 0 }];
  }

  // Determine sizes based on product name keywords
  let sizes: string[] = ['S', 'M', 'L'];
  const nameLower2 = name.toLowerCase();
  if (/blazer|jacket|coat|trouser|pants|shirt|dress|tunic|maxi|mini|skirt/i.test(nameLower2)) {
    // Sizes would be determined more specifically per product type
  }

  // Set default featured/sale status
  const isFeatured = false;
  const isSale = false;

  // Set default rating and reviews
  const rating = 4.5;
  const reviewsCount = 0;

  // Build image array - use the admin image as primary
  const images: string[] = image ? [image] : ['https://images.unsplash.com/photo-1529035175392-6f0f45cd8e0e?auto=format&fit=crop&w=1000&q=85'];

  // Build short description from first sentence or truncated description
  let shortDescription = description ? description.split('.')[0] + '.' : name;

  // Determine sale price (no sale by default)
  const salePrice = undefined;

  return {
    id,
    name,
    slug,
    description,
    shortDescription,
    category,
    categoryLabel: category,
    price,
    salePrice,
    images,
    sizes,
    colors,
    stock,
    sku: `ATL-${id.split('-')[1] || id}`,
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
 * Map an array of admin products to storefront product format.
 */
export function mapAdminProductsToStorefront(adminProds: any[]): Product[] {
  return adminProds.map(mapAdminProductToStorefront);
}

export default mapAdminProductToStorefront;