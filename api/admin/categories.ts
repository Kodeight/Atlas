import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function badFull(body: any): string | null {
  if (!body || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.length > 80) {
    return 'Category name must be 2-80 characters.';
  }
  if (typeof body.slug !== 'string' || !SLUG_RE.test(body.slug)) {
    return 'Slug must be lowercase letters, numbers and dashes.';
  }
  if (body.nameFr !== undefined && (typeof body.nameFr !== 'string' || body.nameFr.length > 80)) return 'Invalid French name.';
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 500)) return 'Invalid description.';
  if (body.sortOrder !== undefined && (!Number.isInteger(body.sortOrder) || body.sortOrder < 0)) return 'Invalid order.';
  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') return 'Invalid flag.';
  return null;
}

export default async function handler(req: any, res: any) {
  const prisma = new PrismaClient();
  try {
    if (req.method === 'GET') {
      // Public read (storefront pills/listings share the same source)
      const categories = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      });
      return res.status(200).json(categories);
    }

    if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });

    if (req.method === 'POST') {
      const err = badFull(req.body);
      if (err) return res.status(400).json({ message: err });
      const taken = await prisma.category.findUnique({ where: { slug: req.body.slug } });
      if (taken) return res.status(400).json({ message: 'This slug is already used.' });
      const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
      const created = await prisma.category.create({
        data: {
          name: req.body.name.trim(),
          nameFr: req.body.nameFr?.trim() || null,
          slug: req.body.slug,
          description: req.body.description?.trim() || null,
          sortOrder: req.body.sortOrder ?? ((maxOrder._max.sortOrder ?? -1) + 1),
          enabled: req.body.enabled ?? true,
        },
      });
      return res.status(201).json(created);
    }

    const id = getQueryId(req);
    if (!id) {
      res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
    const existing = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!existing) return res.status(404).json({ message: 'Category not found.' });

    if (req.method === 'PUT') {
      const err = badFull(req.body);
      if (err) return res.status(400).json({ message: err });
      const taken = await prisma.category.findUnique({ where: { slug: req.body.slug } });
      if (taken && taken.id !== id) return res.status(400).json({ message: 'This slug is already used.' });
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: req.body.name.trim(),
          nameFr: req.body.nameFr?.trim() || null,
          slug: req.body.slug,
          description: req.body.description?.trim() || null,
          sortOrder: req.body.sortOrder ?? existing.sortOrder,
          enabled: req.body.enabled ?? existing.enabled,
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'PATCH') {
      const data: any = {};
      if (req.body?.name !== undefined) {
        if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2) return res.status(400).json({ message: 'Invalid name.' });
        data.name = req.body.name.trim();
      }
      if (req.body?.nameFr !== undefined) data.nameFr = req.body.nameFr?.trim() || null;
      if (req.body?.slug !== undefined) {
        if (typeof req.body.slug !== 'string' || !SLUG_RE.test(req.body.slug)) return res.status(400).json({ message: 'Invalid slug.' });
        const taken = await prisma.category.findUnique({ where: { slug: req.body.slug } });
        if (taken && taken.id !== id) return res.status(400).json({ message: 'This slug is already used.' });
        data.slug = req.body.slug;
      }
      if (req.body?.description !== undefined) data.description = req.body.description?.trim() || null;
      if (req.body?.sortOrder !== undefined) {
        if (!Number.isInteger(req.body.sortOrder) || req.body.sortOrder < 0) return res.status(400).json({ message: 'Invalid order.' });
        data.sortOrder = req.body.sortOrder;
      }
      if (req.body?.enabled !== undefined) {
        if (typeof req.body.enabled !== 'boolean') return res.status(400).json({ message: 'Invalid flag.' });
        data.enabled = req.body.enabled;
      }
      if (Object.keys(data).length === 0) return res.status(400).json({ message: 'Nothing to update.' });
      const updated = await prisma.category.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (existing._count.products > 0) {
        return res.status(400).json({
          message: `Cannot delete: ${existing._count.products} product(s) use this category. Disable it instead.`,
        });
      }
      await prisma.category.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
