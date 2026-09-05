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

function getId(req: any): string | undefined {
  const q = req.query?.id;
  return Array.isArray(q) ? q[0] : q;
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
    const id = getId(req);
    if (!id) return res.status(400).json({ message: 'Product id is required.' });

    if (req.method === 'GET') {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      return res.status(200).json(product);
    }

    // Mutations stay server-enforced behind the admin session
    if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });

    if (req.method === 'PUT') {
      const err = badBody(req.body);
      if (err) return res.status(400).json({ message: err });
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Product not found.' });
      const { name, description, price, image, stock, flavor, color, bgGradient } = req.body;
      const updated = await prisma.product.update({
        where: { id },
        data: { name, description, price, image, stock, flavor, color, bgGradient },
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Product not found.' });
      await prisma.product.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
