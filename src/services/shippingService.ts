import { ALGERIAN_WILAYAS, getWilayaByCode } from '../data/wilayas';

export interface DeliveryCalculationResult {
  wilayaCode: string;
  wilayaName: string;
  deliveryFee: number;
  estimatedDays: string;
  freeDeliveryEligible: boolean;
}

export const FREE_DELIVERY_THRESHOLD = 20000; // in DA, e.g. orders over 20,000 DA get free delivery

export function calculateDelivery(wilayaCode: string, subtotal: number): DeliveryCalculationResult {
  const wilaya = getWilayaByCode(wilayaCode) || ALGERIAN_WILAYAS.find((w) => w.code === '16')!;
  const isFree = subtotal >= FREE_DELIVERY_THRESHOLD;
  
  return {
    wilayaCode: wilaya.code,
    wilayaName: wilaya.name,
    deliveryFee: isFree ? 0 : wilaya.deliveryFee,
    estimatedDays: wilaya.estimatedDays,
    freeDeliveryEligible: isFree,
  };
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US')} DA`;
}
