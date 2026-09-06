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

function badBody(body: any): string | null {
  if (!body || typeof body.name !== 'string' || body.name.trim().length < 3) return 'Product name is required.';
  if (typeof body.description !== 'string' || body.description.trim().length < 10) return 'Product description is required.';
  if (typeof body.price !== 'number' || !(body.price > 0)) return 'Product price must be positive.';
  if (typeof body.image !== 'string' || body.image.length < 1) return 'Product image is required.';
  if (typeof body.stock !== 'number' || !Number.isInteger(body.stock) || body.stock < 0) return 'Product stock must be a non-negative integer.';
  for (const key of ['nameFr', 'descriptionFr', 'flavorFr'] as const) {
    if (body[key] !== undefined && typeof body[key] !== 'string') return `Invalid ${key}.`;
  }
  return null;
}

function pickWritable(body: any) {
  const out: any = {
    name: body.name,
    description: body.description,
    price: body.price,
    image: body.image,
    stock: body.stock,
  };
  if (typeof body.flavor === 'string') out.flavor = body.flavor;
  if (typeof body.color === 'string') out.color = body.color;
  if (typeof body.bgGradient === 'string') out.bgGradient = body.bgGradient;
  if (typeof body.nameFr === 'string') out.nameFr = body.nameFr;
  if (typeof body.descriptionFr === 'string') out.descriptionFr = body.descriptionFr;
  if (typeof body.flavorFr === 'string') out.flavorFr = body.flavorFr;
  return out;
}

function getQueryId(req: any): string | undefined {
  const q = req.query?.id;
  return Array.isArray(q) ? q[0] : q;
}

export default async function handler(req: any, res: any) {
  const prisma = new PrismaClient();
  try {
    const qid = getQueryId(req);
    if (qid) {
      // Single-resource operations via ?id= (explicit rewrite target).
      // Dynamic file routes ([id].ts) do not resolve on this deployment:
      // they fall through to the SPA fallback (GET -> index.html, writes -> empty 405).
      if (req.method === 'GET') {
        const product = await prisma.product.findUnique({ where: { id: qid } });
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        return res.status(200).json(product);
      }
      if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });
      if (req.method === 'PUT') {
        const err = badBody(req.body);
        if (err) return res.status(400).json({ message: err });
        const existing = await prisma.product.findUnique({ where: { id: qid } });
        if (!existing) return res.status(404).json({ message: 'Product not found.' });
        const updated = await prisma.product.update({ where: { id: qid }, data: pickWritable(req.body) });
        return res.status(200).json(updated);
      }
      if (req.method === 'DELETE') {
        const existing = await prisma.product.findUnique({ where: { id: qid } });
        if (!existing) return res.status(404).json({ message: 'Product not found.' });
        await prisma.product.delete({ where: { id: qid } });
        return res.status(200).json({ success: true });
      }
      res.setHeader('Allow', 'GET, PUT, DELETE');
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    if (req.method === 'GET') {
      // Public read (mirrors Express backend: storefront + Admin list from same DB)
      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      // Mutations stay server-enforced behind the admin session
      if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });
      const err = badBody(req.body);
      if (err) return res.status(400).json({ message: err });
      const created = await prisma.product.create({
        data: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...pickWritable(req.body),
          flavor: req.body.flavor || 'Signature',
          color: req.body.color || 'hsl(210, 20%, 35%)',
          bgGradient: req.body.bgGradient || 'from-slate-50 to-slate-200',
        },
      });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
