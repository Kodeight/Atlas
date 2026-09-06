import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';

function requireAdmin(req: any): string | null {
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
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string; userId: string };
    if (payload.role !== 'admin') return null;
    return payload.userId;
  } catch {
    return null;
  }
}

function toProfile(u: any) {
  return { id: u.id, email: u.email, name: u.name, pfp: u.pfp };
}

function getQueryId(req: any): string | undefined {
  const q = req.query?.id;
  return Array.isArray(q) ? q[0] : q;
}

export default async function handler(req: any, res: any) {
  const userId = requireAdmin(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized access' });

  const prisma = new PrismaClient();
  try {
    // Delete via ?id= (explicit rewrite target; dynamic [id] file routes
    // do not resolve on this deployment and fall through to the SPA fallback)
    if (req.method === 'DELETE') {
      const targetId = getQueryId(req);
      if (!targetId) return res.status(400).json({ message: 'Admin id is required.' });
      if (targetId === userId) {
        return res.status(400).json({ message: 'Cannot delete the current signed-in admin.' });
      }
      const target = await prisma.adminUser.findUnique({ where: { id: targetId } });
      if (!target) return res.status(404).json({ message: 'Admin not found.' });
      await prisma.adminUser.delete({ where: { id: targetId } });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      const users = await prisma.adminUser.findMany();
      return res.status(200).json(users.map(toProfile));
    }

    if (req.method === 'POST') {
      const { name, email, password, pfp } = req.body || {};
      if (typeof name !== 'string' || name.trim().length < 3) {
        return res.status(400).json({ message: 'Name must be at least 3 characters.' });
      }
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'A valid email is required.' });
      }
      if (typeof password !== 'string' || password.length < 8 || !/[0-9]/.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters and contain a number.' });
      }
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already exists.' });
      const created = await prisma.adminUser.create({
        data: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          email,
          name,
          pfp: pfp || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
          passwordHash: bcrypt.hashSync(password, 10),
        },
      });
      return res.status(201).json(toProfile(created));
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
