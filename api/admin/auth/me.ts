import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';

function getTokenFromRequest(req: any): string | null {
  // Try cookies object (if cookie-parser style) or header
  const cookies: any = (req as any).cookies;
  if (cookies && cookies[TOKEN_NAME]) return cookies[TOKEN_NAME];
  const cookieHeader = req.headers.cookie as string | undefined;
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith(`${TOKEN_NAME}=`)) {
      return part.substring(TOKEN_NAME.length + 1);
    }
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string; userId: string };
    if (payload.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    // Return minimal user profile - in production would fetch from DB, but for Vercel use static
    return res.status(200).json({
      id: payload.userId,
      email: 'admin@atlas.dz',
      name: 'Store Admin',
      pfp: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    });
  } catch {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
}
