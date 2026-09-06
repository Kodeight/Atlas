import { AdminLang } from './adminText';

export interface CsvOrder {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  products?: { name: string; quantity: number; price: number }[];
  items?: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  shippingCompany?: string | null;
  deliveryType?: string;
}

const HEADERS = ['Order', 'Date', 'Customer', 'Phone', 'Address', 'Items', 'Total (DA)', 'Status', 'Company', 'Delivery'];

function esc(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildOrdersCsv(orders: CsvOrder[], lang: AdminLang): string {
  const lines = [HEADERS.join(',')];
  for (const o of orders) {
    const items = o.products ?? o.items ?? [];
    const delivery =
      o.deliveryType === 'stopdesk' ? 'Stop Desk' : lang === 'fr' ? 'Domicile' : 'Home';
    lines.push(
      [
        esc(o.id),
        esc(o.date ? o.date.slice(0, 10) : ''),
        esc(o.customerName),
        esc(o.phone),
        esc(o.address),
        esc(items.map((it) => `${it.quantity}x ${it.name}`).join('; ')),
        esc(o.total),
        esc(o.status),
        esc(o.shippingCompany || ''),
        esc(delivery),
      ].join(','),
    );
  }
  // BOM so Excel opens UTF-8 (accents) correctly
  return '﻿' + lines.join('\r\n');
}

export function downloadOrdersCsv(orders: CsvOrder[], lang: AdminLang) {
  const blob = new Blob([buildOrdersCsv(orders, lang)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `atlas-orders-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
