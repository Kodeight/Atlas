import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK';
const TOKEN_NAME = 'atlas_admin_token';

function getAdminUsers() {
  try {
    // Try Prisma first if available, fallback to JSON
    // For Vercel serverless, use JSON files as source of truth
    const usersPath = path.join(process.cwd(), 'admin', 'users.json');
    const dataUsersPath = path.join(process.cwd(), 'admin', 'data', 'users.json');
    let users: any[] = [];
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      // users.json may be an object or array - handle both
      if (!Array.isArray(users) && users.users) users = users.users;
      if (!Array.isArray(users)) users = [users];
    }
    if (fs.existsSync(dataUsersPath)) {
      const dataUsers = JSON.parse(fs.readFileSync(dataUsersPath, 'utf-8'));
      if (Array.isArray(dataUsers)) users = dataUsers;
    }
    // Fallback hardcoded atlas admin
    if (users.length === 0) {
      users = [{ id: 'admin-1', email: 'admin@atlas.dz', name: 'Store Admin', passwordHash: bcrypt.hashSync('admin123', 10) }];
    }
    // Normalize
    return users.map((u: any) => ({
      id: u.id || 'admin-1',
      email: u.email,
      name: u.name || 'Store Admin',
      pfp: u.pfp || '',
      passwordHash: u.passwordHash || u.password_hash || bcrypt.hashSync('admin123', 10),
    }));
  } catch {
    return [{ id: 'admin-1', email: 'admin@atlas.dz', name: 'Store Admin', pfp: '', passwordHash: bcrypt.hashSync('admin123', 10) }];
  }
}

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // CORS headers for same-origin (Vercel will handle)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = getAdminUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // Support both atlas and legacy zest email for transition
    const isValidUser = user && bcrypt.compareSync(password, user.passwordHash);
    // Also allow admin / admin123 as username fallback
    const isUsernameFallback = (email === 'admin' || email === 'admin@atlas.dz' || email === 'admin@zest.com') && password === 'admin123';

    if (!user || (!isValidUser && !isUsernameFallback)) {
      // Try to find by username fallback
      if (!isUsernameFallback) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    }

    const targetUser = user || { id: 'admin-1', email: 'admin@atlas.dz', name: 'Store Admin', pfp: '' };
    const SESSION_TTL_SECONDS = 8 * 60 * 60;
    const token = jwt.sign({ role: 'admin', userId: targetUser.id }, JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });

    // Set cookie - must be httpOnly, secure in production, sameSite lax
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
    const cookieParts = [
      `${TOKEN_NAME}=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${SESSION_TTL_SECONDS}`,
    ];
    if (isProd) cookieParts.push('Secure');
    // Do not set Domain to allow Vercel's default domain

    res.setHeader('Set-Cookie', cookieParts.join('; '));

    return res.status(200).json({
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      pfp: targetUser.pfp,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
