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

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  // Aggregates stay server-enforced behind the admin session:
  // revenue must never leak through an unauthenticated endpoint.
  if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });

  const prisma = new PrismaClient();
  try {
    const [products, orders, revenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'delivered' } }),
    ]);
    return res.status(200).json({ products, orders, revenue: revenue._sum.total ?? 0 });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
