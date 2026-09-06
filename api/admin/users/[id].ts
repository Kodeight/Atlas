import jwt from 'jsonwebtoken';
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  const userId = requireAdmin(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized access' });

  const q = req.query?.id;
  const targetId: string | undefined = Array.isArray(q) ? q[0] : q;
  if (!targetId) return res.status(400).json({ message: 'Admin id is required.' });
  if (targetId === userId) {
    return res.status(400).json({ message: 'Cannot delete the current signed-in admin.' });
  }

  const prisma = new PrismaClient();
  try {
    const target = await prisma.adminUser.findUnique({ where: { id: targetId } });
    if (!target) return res.status(404).json({ message: 'Admin not found.' });
    await prisma.adminUser.delete({ where: { id: targetId } });
    return res.status(200).json({ success: true });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
