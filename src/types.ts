export type ProductCategory = 
  | 'all'
  | 'women'
  | 'men'
  | 'dresses'
  | 'tops'
  | 'bottoms'
  | 'sets'
  | 'accessories'
  | 'new-arrivals'
  | 'sale';

export interface ProductColor {
  name: string;
  hex: string;
  imageIndex?: number;
}

export interface ProductSizeOption {
  size: string;
  inStock: boolean;
  stockCount?: number;
}

export interface ProductGalleryImage {
  url: string;
  alt?: string;
  colorName?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number; // in DA
  salePrice?: number; // in DA
  images: string[];
  galleryEnabled?: boolean;
  gallery?: ProductGalleryImage[];
  sizes: string[];
  sizeOptions?: ProductSizeOption[];
  colors: ProductColor[];
  stock: number;
  sku: string;
  isSale: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
  fabricDetails?: string[];
  careInstructions?: string[];
}

export interface CartItem {
  id: string; // unique item id (e.g. productId-size-color)
  productId: string;
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
  unitPrice: number; // in DA
}

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  confirmPhone: string;
  email?: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  notes?: string;
}

export interface Order {
  orderId: string; // e.g. #AT-10482
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'CASH_ON_DELIVERY';
  orderStatus: OrderStatus;
  createdAt: string;
}

export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  zone: 'center' | 'north_east' | 'north_west' | 'high_plateaus' | 'south';
  deliveryFee: number; // in DA
  estimatedDays: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  wilaya?: string;
}
