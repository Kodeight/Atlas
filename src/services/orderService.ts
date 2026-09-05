import { Order, OrderItem, CustomerInfo } from '../types';
import { calculateDelivery } from './shippingService';
import { fetchProductsFromCMS, getAllAtlasProductsFallback } from '../data/products';

const ORDERS_STORAGE_KEY = 'atlas_customer_orders_v1';

/**
 * Generates an official Atlas order number like #AT-10482
 */
export function generateOrderId(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `#AT-${randomDigits}`;
}

export interface CreateOrderPayload {
  customer: CustomerInfo;
  items: {
    productId: string;
    size: string;
    colorName: string;
    quantity: number;
  }[];
}

export interface OrderSubmissionResult {
  success: boolean;
  order?: Order;
  error?: string;
}

/**
 * Submits an order through the server API, also creates it in the CMS backend,
 * with automatic fallback to client-side service.
 */
export class OrderService {
  /**
   * Submits an order through the server API with automatic fallback.
   * Also creates the order in the CMS backend so it appears in the admin panel.
   */
  static async submitOrder(
    payload: CreateOrderPayload,
    products: Product[] = getAllAtlasProductsFallback()
  ): Promise<OrderSubmissionResult> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.order) {
          this.saveLocalOrder(data.order);
          
          // Also create the order in the CMS backend so it appears in the admin order-management section
          await this.createOrderInCMS(data.order, products);
          
          return { success: true, order: data.order };
        }
      }
    } catch (error) {
      console.warn('Backend order API not reachable, using client-side service validation:', error);
    }

    // Client fallback validation and recalculation
    return this.createOrderLocally(payload, products);
  }

  /**
   * Create an order in the CMS backend so it appears in the admin order-management section.
   * Sends product information so the CMS can display correct order details.
   */
  private static async createOrderInCMS(order: Order, products: Product[]): Promise<void> {
    try {
      // Build product details from the products array
      const productDetails = order.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        
        const colorObj = product.colors.find((c) => c.name === item.colorName) || product.colors[0];
        const image = product.images[colorObj?.imageIndex ?? 0] || product.images[0];
        
        return {
          productId: product.id,
          productName: product.name,
          productImage: image,
          size: item.size,
          color: colorObj?.name || 'Default',
          colorHex: colorObj?.hex || '#1F5742',
          quantity: item.quantity,
          unitPrice: product.salePrice ?? product.price,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: order.customer.fullName,
          phone: order.customer.phone,
          address: order.customer.address,
          items: productDetails,
          total: order.total,
          status: 'pending',
        }),
      });
    } catch (error) {
      console.warn('Could not create order in CMS backend:', error);
      // Non-critical - order was still created in the storefront system
    }
  }

  /**
   * Client-side recalculation and validation fallback.
   * Uses the provided products array for product lookups.
   */
  private static createOrderLocally(
    payload: CreateOrderPayload,
    products: Product[] = getAllAtlasProductsFallback()
  ): OrderSubmissionResult {
    const { customer, items } = payload;

    // Validate customer fields
    if (!customer.fullName?.trim()) return { success: false, error: 'Full name is required.' };
    if (!customer.phone?.trim()) return { success: false, error: 'Phone number is required.' };
    if (!customer.wilayaCode) return { success: false, error: 'Please select an Algerian Wilaya.' };
    if (!customer.commune?.trim()) return { success: false, error: 'City / Commune is required.' };
    if (!customer.address?.trim()) return { success: false, error: 'Delivery address is required.' };
    if (items.length === 0) return { success: false, error: 'Order must contain at least one item.' };

    const validatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productId} was not found in catalog.` };
      }

      if (item.quantity <= 0) {
        return { success: false, error: `Invalid quantity for ${product.name}.` };
      }

      const activePrice = product.salePrice ?? product.price;
      const colorObj = product.colors.find((c) => c.name === item.colorName) || product.colors[0];
      const image = product.images[colorObj?.imageIndex ?? 0] || product.images[0];

      const lineTotal = activePrice * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: image,
        size: item.size,
        color: colorObj?.name || 'Default',
        colorHex: colorObj?.hex || '#1F5742',
        quantity: item.quantity,
        unitPrice: activePrice,
        totalPrice: lineTotal,
      });
    }

    const delivery = calculateDelivery(customer.wilayaCode, subtotal);
    const total = subtotal + delivery.deliveryFee;

    const newOrder: Order = {
      orderId: generateOrderId(),
      customer: {
        ...customer,
        wilayaName: delivery.wilayaName,
      },
      items: validatedItems,
      subtotal,
      deliveryFee: delivery.deliveryFee,
      total,
      paymentMethod: 'CASH_ON_DELIVERY',
      orderStatus: 'PENDING_CONFIRMATION',
      createdAt: new Date().toISOString(),
    };

    this.saveLocalOrder(newOrder);
    return { success: true, order: newOrder };
  }

  static saveLocalOrder(order: Order): void {
    try {
      const existing = this.getLocalOrders();
      const updated = [order, ...existing.filter((o) => o.orderId !== order.orderId)];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }

  static getLocalOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async getOrderById(orderId: string): Promise<Order | undefined> {
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.order) return data.order;
      }
    } catch {
      // fallback
    }

    const localOrders = this.getLocalOrders();
    return localOrders.find((o) => o.orderId === orderId);
  }
}

/**
 * Get Atlas fallback products for order service when CMS products are not available.
 */
function getAllAtlasProductsFallback(): Product[] {
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
      images: ['/tee-white.webp'],
    },
    {
      id: 'atl-shr-002',
      name: 'Oversized Linen Shirt',
      slug: 'oversized-linen-shirt',
      category: 'tops',
      categoryLabel: 'Tops & Shirts',
      price: 5200,
      stock: 22,
      colors: [{ name: 'Natural Sand', hex: '#E4DDD2' }],
      images: ['/linen-shirt-natural.webp'],
    },
    {
      id: 'atl-drs-003',
      name: 'Satin Pleated Evening Dress',
      slug: 'satin-pleated-evening-dress',
      category: 'dresses',
      categoryLabel: "Women's Evening",
      price: 8900,
      stock: 9,
      colors: [{ name: 'Atlas Emerald', hex: '#1F5742' }],
      images: ['/satin-dress.webp'],
    },
    {
      id: 'atl-jmp-001',
      name: 'Floral Summer Jumpsuit',
      slug: 'floral-summer-jumpsuit',
      category: 'dresses',
      categoryLabel: "Women's Clothing",
      price: 6000,
      stock: 14,
      colors: [{ name: 'Rose Pink', hex: '#E8A598' }],
      images: ['/jumpsuit-floral.webp'],
    },
  ];
}