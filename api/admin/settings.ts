import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';

function requireAdmin(req: any): boolean {
  const cookies: any = (req as any).cookies;
  let token: string | null = (cookies && cookies[TOKEN_NAME]) || null;
  if (!token) {
    const cookieHeader = req.headers?.cookie as string | undefined;
    if (cookieHeader) {
      for (const part of cookieHeader.split(';').map((c) => c.trim())) {
        if (part.startsWith(`${TOKEN_NAME}=`)) token = part.substring(TOKEN_NAME.length + 1);
      }
    }
  }
  if (!token) return false;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string; userId: string };
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

const DEFAULTS = {
  id: 'default',
  storeName: 'Atlas',
  logo: null,
  favicon: null,
  description: null,
  contactEmail: null,
  phone: null,
  address: null,
  currency: 'DZD',
  currencySymbol: 'DA',
  defaultCountry: 'Algeria',
  defaultLanguage: 'fr',
  deliveryEnabled: true,
  defaultDeliveryFee: 0,
  freeDeliveryThreshold: null,
  codEnabled: true,
  defaultOrderStatus: 'pending',
};

function pickUpdatable(body: any): { ok: boolean; data?: any; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'Invalid settings.' };
  const data: any = {};
  const str = (v: any, max: number) => (typeof v === 'string' && v.length <= max ? v : undefined);
  const setStr = (key: string, max: number, email = false) => {
    if (body[key] === undefined) return true;
    if (body[key] === null || body[key] === '') { data[key] = null; return true; }
    const v = str(body[key], max);
    if (v === undefined) return false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return false;
    data[key] = v;
    return true;
  };
  for (const [key, max, email] of [
    ['storeName', 120, false], ['logo', 2000, false], ['favicon', 2000, false],
    ['description', 1000, false], ['contactEmail', 120, true], ['phone', 30, false],
    ['address', 500, false], ['currency', 10, false], ['currencySymbol', 10, false],
    ['defaultCountry', 80, false],
  ] as const) {
    if (!setStr(key, max, email)) return { ok: false, error: `Invalid ${key}.` };
  }
  if (body.defaultLanguage !== undefined) {
    if (body.defaultLanguage !== 'fr' && body.defaultLanguage !== 'en') return { ok: false, error: 'Invalid language.' };
    data.defaultLanguage = body.defaultLanguage;
  }
  if (body.deliveryEnabled !== undefined) {
    if (typeof body.deliveryEnabled !== 'boolean') return { ok: false, error: 'Invalid delivery flag.' };
    data.deliveryEnabled = body.deliveryEnabled;
  }
  if (body.defaultDeliveryFee !== undefined) {
    if (!Number.isInteger(body.defaultDeliveryFee) || body.defaultDeliveryFee < 0) return { ok: false, error: 'Invalid delivery fee.' };
    data.defaultDeliveryFee = body.defaultDeliveryFee;
  }
  if (body.freeDeliveryThreshold !== undefined) {
    if (body.freeDeliveryThreshold !== null && (!Number.isInteger(body.freeDeliveryThreshold) || body.freeDeliveryThreshold < 0)) {
      return { ok: false, error: 'Invalid free-delivery threshold.' };
    }
    data.freeDeliveryThreshold = body.freeDeliveryThreshold;
  }
  if (body.codEnabled !== undefined) {
    if (typeof body.codEnabled !== 'boolean') return { ok: false, error: 'Invalid COD flag.' };
    data.codEnabled = body.codEnabled;
  }
  if (body.defaultOrderStatus !== undefined) {
    if (!['pending', 'processing', 'delivered'].includes(body.defaultOrderStatus)) return { ok: false, error: 'Invalid order status.' };
    data.defaultOrderStatus = body.defaultOrderStatus;
  }
  if (Object.keys(data).length === 0) return { ok: false, error: 'Nothing to update.' };
  return { ok: true, data };
}

export default async function handler(req: any, res: any) {
  const prisma = new PrismaClient();
  try {
    if (req.method === 'GET') {
      const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
      return res.status(200).json(settings ?? DEFAULTS);
    }
    if (req.method === 'PUT') {
      if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });
      const parsed = pickUpdatable(req.body);
      if (!parsed.ok) return res.status(400).json({ message: parsed.error });
      const updated = await prisma.storeSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...parsed.data },
        update: parsed.data,
      });
      return res.status(200).json(updated);
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
