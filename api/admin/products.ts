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
  return null;
}

export default async function handler(req: any, res: any) {
  const prisma = new PrismaClient();
  try {
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
      const { name, description, price, image, stock, flavor, color, bgGradient } = req.body;
      const created = await prisma.product.create({
        data: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name, description, price, image, stock,
          flavor: flavor || 'Signature',
          color: color || 'hsl(210, 20%, 35%)',
          bgGradient: bgGradient || 'from-slate-50 to-slate-200',
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
