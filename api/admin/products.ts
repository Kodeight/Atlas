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

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
// Name → hex recognition lives client-side (src/components/admin/colorNames.ts).
// The server requires a valid hex and stores the name only when provided.

function badBody(body: any): string | null {
  if (!body || typeof body.name !== 'string' || body.name.trim().length < 3) return 'Product name is required.';
  if (typeof body.description !== 'string' || body.description.trim().length < 10) return 'Product description is required.';
  if (typeof body.price !== 'number' || !(body.price > 0)) return 'Product price must be positive.';
  if (typeof body.image !== 'string' || body.image.length < 1) return 'Product image is required.';
  if (typeof body.stock !== 'number' || !Number.isInteger(body.stock) || body.stock < 0) return 'Product stock must be a non-negative integer.';
  for (const key of ['nameFr', 'descriptionFr', 'flavorFr'] as const) {
    if (body[key] !== undefined && typeof body[key] !== 'string') return `Invalid ${key}.`;
  }
  if (typeof body.galleryEnabled !== 'undefined' && typeof body.galleryEnabled !== 'boolean') return 'Invalid gallery flag.';
  if (body.colors !== undefined) {
    if (!Array.isArray(body.colors) || body.colors.length > 40) return 'Invalid colors.';
    for (const c of body.colors) {
      if (!c) return 'Invalid colors.';
      if (c.name !== undefined && (typeof c.name !== 'string' || c.name.length > 80)) return 'Invalid color name.';
      if (typeof c.hex !== 'string' || !HEX_RE.test(c.hex)) return 'Each color needs a hex like #1F5742.';
      if (c.nameFr !== undefined && typeof c.nameFr !== 'string') return 'Invalid color name.';
      if (c.label !== undefined && typeof c.label !== 'string') return 'Invalid color label.';
    }
  }
  if (body.sizes !== undefined) {
    if (!Array.isArray(body.sizes) || body.sizes.length > 30) return 'Invalid sizes.';
    for (const s of body.sizes) {
      if (!s || typeof s.label !== 'string' || s.label.trim().length < 1 || s.label.length > 10) return 'Each size needs a label.';
      if (s.enabled !== undefined && typeof s.enabled !== 'boolean') return 'Invalid size flag.';
      if (s.stock !== undefined && s.stock !== null && (!Number.isInteger(s.stock) || s.stock < 0)) return 'Invalid size stock.';
    }
  }
  if (body.images !== undefined) {
    if (!Array.isArray(body.images) || body.images.length > 30) return 'Invalid gallery images.';
    for (const g of body.images) {
      if (!g || typeof g.url !== 'string' || g.url.length < 1 || g.url.length > 2000) return 'Each gallery image needs a URL.';
      if (g.alt !== undefined && typeof g.alt !== 'string') return 'Invalid image alt text.';
    }
  }
  return null;
}

const REL_INCLUDE = {
  colors: { orderBy: { position: 'asc' as const } },
  sizes: { orderBy: { position: 'asc' as const } },
  images: { orderBy: { position: 'asc' as const } },
};

async function saveRelations(prisma: any, productId: string, body: any) {
  await prisma.$transaction(async (tx: any) => {
    const colorIdByKey = new Map<string, string>();
    if (Array.isArray(body.colors)) {
      await tx.productColor.deleteMany({ where: { productId } });
      for (let i = 0; i < body.colors.length; i++) {
        const c = body.colors[i];
        const created = await tx.productColor.create({
          data: {
            productId,
            name: typeof c.name === 'string' && c.name.trim() ? c.name.trim() : null,
            nameFr: c.nameFr || null,
            hex: c.hex,
            label: c.label || null,
            position: i,
          },
        });
        if (c.key) colorIdByKey.set(c.key, created.id);
      }
    }
    if (Array.isArray(body.sizes)) {
      await tx.productSize.deleteMany({ where: { productId } });
      for (let i = 0; i < body.sizes.length; i++) {
        const s = body.sizes[i];
        await tx.productSize.create({
          data: { productId, label: s.label, enabled: s.enabled ?? true, stock: s.stock ?? null, position: i },
        });
      }
    }
    if (Array.isArray(body.images)) {
      await tx.productImage.deleteMany({ where: { productId } });
      for (let i = 0; i < body.images.length; i++) {
        const g = body.images[i];
        let colorId: string | null = null;
        if (g.colorKey) {
          if (colorIdByKey.has(g.colorKey)) {
            colorId = colorIdByKey.get(g.colorKey)!;
          } else {
            const existing = await tx.productColor.findUnique({ where: { id: g.colorKey } });
            if (existing && existing.productId === productId) colorId = existing.id;
          }
        }
        await tx.productImage.create({
          data: { productId, url: g.url, alt: g.alt || null, position: i, colorId },
        });
      }
    }
  });
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
  if (typeof body.galleryEnabled === 'boolean') out.galleryEnabled = body.galleryEnabled;
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
        const product = await prisma.product.findUnique({ where: { id: qid }, include: REL_INCLUDE });
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        return res.status(200).json(product);
      }
      if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });
      if (req.method === 'PUT') {
        const err = badBody(req.body);
        if (err) return res.status(400).json({ message: err });
        const existing = await prisma.product.findUnique({ where: { id: qid } });
        if (!existing) return res.status(404).json({ message: 'Product not found.' });
        await prisma.product.update({ where: { id: qid }, data: pickWritable(req.body) });
        await saveRelations(prisma, qid, req.body);
        const updated = await prisma.product.findUnique({ where: { id: qid }, include: REL_INCLUDE });
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
      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, include: REL_INCLUDE });
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      // Mutations stay server-enforced behind the admin session
      if (!requireAdmin(req)) return res.status(401).json({ message: 'Unauthorized access' });
      const err = badBody(req.body);
      if (err) return res.status(400).json({ message: err });
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await prisma.product.create({
        data: {
          id,
          ...pickWritable(req.body),
          flavor: req.body.flavor || 'Signature',
          color: req.body.color || 'hsl(210, 20%, 35%)',
          bgGradient: req.body.bgGradient || 'from-slate-50 to-slate-200',
        },
      });
      await saveRelations(prisma, id, req.body);
      const created = await prisma.product.findUnique({ where: { id }, include: REL_INCLUDE });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
