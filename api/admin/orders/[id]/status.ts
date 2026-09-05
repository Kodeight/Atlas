import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';
const STATUSES = ['pending', 'processing', 'delivered'];

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
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  // Status changes stay server-enforced behind the admin session
  if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });

  const q = req.query?.id;
  const id: string | undefined = Array.isArray(q) ? q[0] : q;
  if (!id) return res.status(400).json({ message: 'Order id is required.' });
  if (!req.body || !STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: 'Valid status is required.' });
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Order not found.' });
    const updated = await prisma.order.update({
      where: { id },
      data: { status: req.body.status },
      include: { items: true },
    });
    return res.status(200).json({ ...updated, date: updated.date.toISOString() });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
