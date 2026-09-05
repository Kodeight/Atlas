import { Order, OrderItem, CustomerInfo } from '../types';
import { calculateDelivery } from './shippingService';
import { getProductById } from '../data/products';

const ORDERS_STORAGE_KEY = 'atlas_customer_orders_v1';

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
 * Generates an official Atlas order number like #AT-10482
 */
export function generateOrderId(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `#AT-${randomDigits}`;
}

export class OrderService {
  /**
   * Submits an order through the server API with automatic fallback
   */
  static async submitOrder(payload: CreateOrderPayload): Promise<OrderSubmissionResult> {
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
          return { success: true, order: data.order };
        }
      }
    } catch {
      // Fall through to client validation if server is unreachable
      console.warn('Backend order API not reachable, using client-side service validation');
    }

    // Client fallback validation and recalculation
    return this.createOrderLocally(payload);
  }

  /**
   * Client-side recalculation and validation fallback
   */
  private static createOrderLocally(payload: CreateOrderPayload): OrderSubmissionResult {
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
      const product = getProductById(item.productId);
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
