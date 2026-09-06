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

const STATUSES = ['pending', 'processing', 'delivered'];

function getQueryId(req: any): string | undefined {
  const q = req.query?.id;
  return Array.isArray(q) ? q[0] : q;
}

export default async function handler(req: any, res: any) {
  // Status updates via ?id= (explicit rewrite target; dynamic [id] file routes
  // do not resolve on this deployment and fall through to the SPA fallback)
  if (req.method === 'PATCH') {
    if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });
    const id = getQueryId(req);
    if (!id) return res.status(400).json({ message: 'Order id is required.' });
    const data: { status?: string; shippingCompany?: string | null; deliveryType?: string } = {};
    if (req.body?.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: 'Valid status is required.' });
      }
      data.status = req.body.status;
    }
    if (req.body?.company !== undefined) {
      if (typeof req.body.company !== 'string' || req.body.company.length > 100) {
        return res.status(400).json({ message: 'Valid company is required.' });
      }
      data.shippingCompany = req.body.company || null;
    }
    if (req.body?.deliveryType !== undefined) {
      if (!['home', 'stopdesk'].includes(req.body.deliveryType)) {
        return res.status(400).json({ message: 'Valid delivery type is required.' });
      }
      data.deliveryType = req.body.deliveryType;
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nothing to update.' });
    }
    const prisma = new PrismaClient();
    try {
      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Order not found.' });
      const updated = await prisma.order.update({
        where: { id },
        data,
        include: { items: true },
      });
      return res.status(200).json({ ...updated, date: updated.date.toISOString() });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  // Order list stays server-enforced behind the admin session
  if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });

  const prisma = new PrismaClient();
  try {
    const orders = (await prisma.order.findMany({ include: { items: true } })) as Array<{
      date: Date;
      items: unknown[] | undefined;
      [key: string]: unknown;
    }>;
    return res.status(200).json(
      orders.map((order) => ({
        ...order,
        products: order.items,
        date: order.date.toISOString(),
      })),
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
