import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';
const DELIVERY_TYPES = ['home', 'stopdesk'];

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

function getQueryId(req: any): string | undefined {
  const q = req.query?.id;
  return Array.isArray(q) ? q[0] : q;
}

export default async function handler(req: any, res: any) {
  // Reads are open so the checkout/storefront can list active companies;
  // all mutations stay behind the admin session.
  const prisma = new PrismaClient();
  try {
    if (req.method === 'GET') {
      const companies = await prisma.shippingCompany.findMany({ orderBy: { createdAt: 'asc' } });
      return res.status(200).json(companies);
    }

    if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });

    if (req.method === 'POST') {
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ message: 'Company name must be 2-100 characters.' });
      }
      const existing = await prisma.shippingCompany.findUnique({ where: { name } });
      if (existing) return res.status(400).json({ message: 'This company already exists.' });
      const created = await prisma.shippingCompany.create({ data: { name, active: true } });
      return res.status(201).json(created);
    }

    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const id = getQueryId(req);
      if (!id) return res.status(400).json({ message: 'Company id is required.' });
      const existing = await prisma.shippingCompany.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Company not found.' });
      if (req.method === 'DELETE') {
        await prisma.shippingCompany.delete({ where: { id } });
        return res.status(200).json({ success: true });
      }
      const data: { name?: string; active?: boolean } = {};
      if (typeof req.body?.name === 'string' && req.body.name.trim().length >= 2) data.name = req.body.name.trim();
      if (typeof req.body?.active === 'boolean') data.active = req.body.active;
      if (Object.keys(data).length === 0) return res.status(400).json({ message: 'Nothing to update.' });
      if (data.name) {
        const taken = await prisma.shippingCompany.findUnique({ where: { name: data.name } });
        if (taken && taken.id !== id) return res.status(400).json({ message: 'This company already exists.' });
      }
      const updated = await prisma.shippingCompany.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
