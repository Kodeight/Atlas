/// <reference path="./bcryptjs.d.ts" />
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

// Prisma may not be generated in some environments (e.g., Vercel without DB); fallback to in-memory
let prisma: any;
try {
  prisma = new PrismaClient();
} catch {
  // Fallback in-memory store for Vercel preview without DB
  const store = {
    adminUsers: new Map<string, any>([["admin-1", { id: "admin-1", email: "admin@atlas.dz", name: "Store Admin", pfp: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80", passwordHash: bcrypt.hashSync("admin123", 10) }]]),
    products: new Map<string, any>(),
    orders: new Map<string, any>(),
    orderItems: new Map<string, any>(),
    companies: new Map<string, any>([
      ["fb-comp-1", { id: "fb-comp-1", name: "Yalidine", active: true, createdAt: new Date() }],
      ["fb-comp-2", { id: "fb-comp-2", name: "ZR Express", active: true, createdAt: new Date() }],
      ["fb-comp-3", { id: "fb-comp-3", name: "Maestro", active: true, createdAt: new Date() }],
    ]),
  };
  prisma = {
    adminUser: {
      findUnique: async ({ where }: any) => {
        if (where.email) return Array.from(store.adminUsers.values()).find((u: any) => u.email === where.email) || null;
        if (where.id) return store.adminUsers.get(where.id) || null;
        return null;
      },
      findFirst: async ({ where }: any) => {
        if (where.email) return Array.from(store.adminUsers.values()).find((u: any) => u.email === where.email && u.id !== where.NOT?.id) || null;
        return null;
      },
      findMany: async () => Array.from(store.adminUsers.values()),
      create: async ({ data }: any) => { store.adminUsers.set(data.id, data); return data; },
      update: async ({ where, data }: any) => { const u = store.adminUsers.get(where.id); if (u) Object.assign(u, data); return u; },
      delete: async ({ where }: any) => { store.adminUsers.delete(where.id); },
    },
    product: {
      count: async () => store.products.size,
      findMany: async (args?: any) => {
        let arr = Array.from(store.products.values());
        if (args?.orderBy?.createdAt) arr = arr.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        return arr;
      },
      findUnique: async ({ where }: any) => store.products.get(where.id) || null,
      create: async ({ data }: any) => { const p = { ...data, createdAt: new Date() }; store.products.set(data.id, p); return p; },
      createMany: async ({ data }: any) => { data.forEach((d: any) => store.products.set(d.id, { ...d, createdAt: new Date() })); return { count: data.length }; },
      update: async ({ where, data }: any) => { const p = store.products.get(where.id); if (p) Object.assign(p, data); return p; },
      delete: async ({ where }: any) => { store.products.delete(where.id); },
    },
    shippingCompany: {
      count: async () => store.companies.size,
      findMany: async () => Array.from(store.companies.values()),
      findUnique: async ({ where }: any) => {
        if (where.id) return store.companies.get(where.id) || null;
        if (where.name) return Array.from(store.companies.values()).find((c: any) => c.name === where.name) || null;
        return null;
      },
      create: async ({ data }: any) => { const c = { ...data, id: data.id || `comp-${Date.now()}`, createdAt: new Date() }; store.companies.set(c.id, c); return c; },
      createMany: async ({ data }: any) => {
        data.forEach((d: any, i: number) => {
          const id = `comp-seed-${Date.now()}-${i}`;
          store.companies.set(id, { ...d, id, createdAt: new Date() });
        });
        return { count: data.length };
      },
      update: async ({ where, data }: any) => { const c = store.companies.get(where.id); if (c) Object.assign(c, data); return c; },
      delete: async ({ where }: any) => { store.companies.delete(where.id); },
    },
    $transaction: async (cb: any) => cb(prisma),
    productColor: {
      deleteMany: async () => ({ count: 0 }),
      create: async ({ data }: any) => ({ ...data, id: `c-${Date.now()}` }),
      findUnique: async () => null,
    },
    productSize: {
      deleteMany: async () => ({ count: 0 }),
      create: async ({ data }: any) => ({ ...data, id: `s-${Date.now()}` }),
    },
    productImage: {
      deleteMany: async () => ({ count: 0 }),
      create: async ({ data }: any) => ({ ...data, id: `g-${Date.now()}`, createdAt: new Date() }),
    },
    storeSettings: {
      _row: null as any,
      findUnique: async function (this: any) { return this._row; },
      upsert: async function (this: any, { create, update }: any) {
        this._row = { ...(this._row || { id: 'default' }), ...create, ...update };
        return this._row;
      },
    },
    order: {
      create: async ({ data, include }: any) => {
        const id = `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const order: any = { id, customerName: data.customerName, phone: data.phone, address: data.address, total: data.total, status: data.status, shippingCompany: data.shippingCompany ?? null, deliveryType: data.deliveryType ?? 'home', date: data.date, items: [] };
        if (data.items?.create) {
          for (const it of data.items.create) {
            const itemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const item = { id: itemId, orderId: id, ...it };
            store.orderItems.set(itemId, item);
            order.items.push(item);
          }
        }
        store.orders.set(id, order);
        return order;
      },
      findMany: async (args?: any) => {
        const orders = Array.from(store.orders.values()).map((o: any) => ({ ...o, items: Array.from(store.orderItems.values()).filter((it: any) => it.orderId === o.id) }));
        return orders;
      },
      findUnique: async ({ where, include }: any) => {
        const o = store.orders.get(where.id);
        if (!o) return null;
        return { ...o, items: Array.from(store.orderItems.values()).filter((it: any) => it.orderId === where.id) };
      },
      update: async ({ where, data, include }: any) => {
        const o = store.orders.get(where.id);
        if (o) {
          if (data.status !== undefined) o.status = data.status;
          if (data.shippingCompany !== undefined) o.shippingCompany = data.shippingCompany;
          if (data.deliveryType !== undefined) o.deliveryType = data.deliveryType;
        }
        return { ...o, items: Array.from(store.orderItems.values()).filter((it: any) => it.orderId === where.id), date: o.date };
      },
    },
  };
}
const JWT_SECRET = process.env.JWT_SECRET || "xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK";
const APP_URL = process.env.APP_URL || "";
const TOKEN_NAME = "atlas_admin_token";

const cookieOptionsBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 15 * 60 * 1000,
  path: "/",
};

export interface AdminUserData {
  id: string;
  email: string;
  name: string;
  pfp: string;
  passwordHash: string;
}

export interface AdminUserProfile {
  id: string;
  email: string;
  name: string;
  pfp: string;
}

function toProfile(user: AdminUserData): AdminUserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pfp: user.pfp,
  };
}

function deriveFlavor(name: string) {
  if (/orange/i.test(name)) return "Orange";
  if (/lemon/i.test(name)) return "Lemon";
  if (/berry/i.test(name)) return "Berry Blast";
  if (/lime/i.test(name)) return "Lime";
  return "Signature";
}

function defaultProductTheme(name: string) {
  if (/orange/i.test(name)) {
    return { color: "hsl(28, 100%, 55%)", bgGradient: "from-orange-50 to-amber-50" };
  }
  if (/lemon/i.test(name)) {
    return { color: "hsl(48, 95%, 55%)", bgGradient: "from-yellow-50 to-amber-50" };
  }
  if (/berry/i.test(name)) {
    return { color: "hsl(340, 80%, 50%)", bgGradient: "from-pink-50 to-purple-50" };
  }
  if (/lime/i.test(name)) {
    return { color: "hsl(85, 60%, 50%)", bgGradient: "from-green-50 to-emerald-50" };
  }
  return { color: "hsl(210, 20%, 35%)", bgGradient: "from-slate-50 to-slate-200" };
}

const colorInputSchema = z.object({
  key: z.string().max(80).optional(),
  name: z.string().min(1).max(80),
  nameFr: z.string().max(80).optional(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex must look like #1F5742."),
  label: z.string().max(40).optional(),
});

const sizeInputSchema = z.object({
  key: z.string().max(80).optional(),
  label: z.string().min(1).max(10),
  enabled: z.boolean().optional(),
  stock: z.number().int().nonnegative().nullable().optional(),
});

const imageInputSchema = z.object({
  key: z.string().max(80).optional(),
  url: z.string().min(1).max(2000),
  alt: z.string().max(200).optional(),
  colorKey: z.string().max(80).optional(),
});

function normalizeProductData(data: z.infer<typeof productSchema>) {
  const theme = defaultProductTheme(data.name);
  const { colors, sizes, images, ...scalars } = data as Record<string, unknown>;
  return {
    ...scalars,
    flavor: (scalars.flavor as string) || deriveFlavor(data.name),
    color: (scalars.color as string) || theme.color,
    bgGradient: (scalars.bgGradient as string) || theme.bgGradient,
  };
}

type VariantPayload = {
  colors?: z.infer<typeof colorInputSchema>[];
  sizes?: z.infer<typeof sizeInputSchema>[];
  images?: z.infer<typeof imageInputSchema>[];
};

// Replaces a product's colors/sizes/images sets transactionally.
// Only called for arrays the client actually sent; absent arrays are left untouched
// so older clients (e.g. the one-time import script) keep working unchanged.
async function saveProductRelations(productId: string, payload: VariantPayload) {
  await prisma.$transaction(async (tx) => {
    const colorIdByKey = new Map<string, string>();
    if (payload.colors) {
      await tx.productColor.deleteMany({ where: { productId } });
      for (let i = 0; i < payload.colors.length; i++) {
        const c = payload.colors[i];
        const created = await tx.productColor.create({
          data: {
            productId,
            name: c.name,
            nameFr: c.nameFr || null,
            hex: c.hex,
            label: c.label || null,
            position: i,
          },
        });
        if (c.key) colorIdByKey.set(c.key, created.id);
      }
    }
    if (payload.sizes) {
      await tx.productSize.deleteMany({ where: { productId } });
      for (let i = 0; i < payload.sizes.length; i++) {
        const s = payload.sizes[i];
        await tx.productSize.create({
          data: {
            productId,
            label: s.label,
            enabled: s.enabled ?? true,
            stock: s.stock ?? null,
            position: i,
          },
        });
      }
    }
    if (payload.images) {
      await tx.productImage.deleteMany({ where: { productId } });
      for (let i = 0; i < payload.images.length; i++) {
        const g = payload.images[i];
        let colorId: string | null = null;
        if (g.colorKey) {
          if (colorIdByKey.has(g.colorKey)) {
            colorId = colorIdByKey.get(g.colorKey)!;
          } else {
            // Reference to a pre-existing color (colors list untouched by this save)
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

const productRelationsInclude = {
  colors: { orderBy: { position: "asc" as const } },
  sizes: { orderBy: { position: "asc" as const } },
  images: { orderBy: { position: "asc" as const } },
};

function isValidImagePath(value: string) {
  if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) return true;
  if (/^[\w\-./]+\.(png|jpg|jpeg|webp|gif|avif|svg)$/i.test(value)) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getRouteParamId(param: string | string[] | undefined): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

const COOKIE_OPTIONS = {
  ...cookieOptionsBase,
  ...(function () {
    if (process.env.NODE_ENV !== "production" || !APP_URL) return {};
    try {
      return { domain: new URL(APP_URL).hostname };
    } catch {
      return {};
    }
  })(),
};

const productSchema = z.object({
  name: z.string().min(3).max(120),
  nameFr: z.string().min(1).max(120).optional(),
  flavor: z.string().min(2).max(100).optional(),
  flavorFr: z.string().min(1).max(100).optional(),
  descriptionFr: z.string().min(1).max(1000).optional(),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  image: z.string().min(1).refine(isValidImagePath, {
    message: "Image must be a valid URL or local path.",
  }),
  stock: z.number().int().nonnegative(),
  color: z.string().optional(),
  bgGradient: z.string().optional(),
  galleryEnabled: z.boolean().optional(),
  colors: z.array(colorInputSchema).max(40).optional(),
  sizes: z.array(sizeInputSchema).max(30).optional(),
  images: z.array(imageInputSchema).max(30).optional(),
});

const orderSchema = z.object({
  customerName: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  address: z.string().min(5).max(500),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    }),
  ).min(1),
  total: z.number().positive(),
});

const statusSchema = z.object({
  status: z.enum(["pending", "processing", "delivered"]),
});

const orderPatchSchema = z
  .object({
    status: z.enum(["pending", "processing", "delivered"]).optional(),
    company: z.string().max(100).optional(),
    deliveryType: z.enum(["home", "stopdesk"]).optional(),
  })
  .refine((d) => d.status !== undefined || d.company !== undefined || d.deliveryType !== undefined, {
    message: "Nothing to update.",
  });

const companySchema = z.object({
  name: z.string().min(2).max(100),
  active: z.boolean().optional(),
});

const settingsSchema = z
  .object({
    storeName: z.string().min(2).max(120).optional(),
    logo: z.string().max(2000).optional(),
    favicon: z.string().max(2000).optional(),
    description: z.string().max(1000).optional(),
    contactEmail: z.string().email().max(120).optional().or(z.literal("")),
    phone: z.string().max(30).optional(),
    address: z.string().max(500).optional(),
    currency: z.string().min(1).max(10).optional(),
    currencySymbol: z.string().min(1).max(10).optional(),
    defaultCountry: z.string().min(2).max(80).optional(),
    defaultLanguage: z.enum(["fr", "en"]).optional(),
    deliveryEnabled: z.boolean().optional(),
    defaultDeliveryFee: z.number().int().nonnegative().optional(),
    freeDeliveryThreshold: z.number().int().nonnegative().nullable().optional(),
    codEnabled: z.boolean().optional(),
    defaultOrderStatus: z.enum(["pending", "processing", "delivered"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update." });

export type ProductAdmin = z.infer<typeof productSchema> & { id: string };
export type OrderStatus = "pending" | "processing" | "delivered";
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
export interface OrderAdmin {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  products: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
}

const ADMIN_EMAIL = "admin@atlas.dz";

const atlasProductSeeds = [
  {
    id: "atl-blz-004",
    name: "Relaxed Tailored Blazer",
    description: "Single-breasted fluid wool-blend blazer with structured lapels and clean welt pockets.",
    price: 9500,
    image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=85",
    stock: 16,
    color: "hsl(210, 20%, 35%)",
    bgGradient: "from-slate-50 to-slate-200",
  },
  {
    id: "atl-tee-007",
    name: "Classic Cotton Crewneck T-Shirt",
    description: "Heavyweight 240 GSM combed cotton tee with ribbed collar and relaxed drape.",
    price: 3200,
    image: "/crowneck.png",
    stock: 35,
    color: "hsl(0, 0%, 100%)",
    bgGradient: "from-slate-50 to-slate-200",
  },
  {
    id: "atl-shr-002",
    name: "Oversized Linen Shirt",
    description: "Pure European flax linen shirt with a relaxed dropped-shoulder silhouette.",
    price: 5200,
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1000&q=85",
    stock: 22,
    color: "hsl(48, 95%, 55%)",
    bgGradient: "from-yellow-50 to-amber-50",
  },
  {
    id: "atl-drs-003",
    name: "Satin Pleated Evening Dress",
    description: "Lustrous emerald satin maxi dress featuring fine sunburst accordion pleats.",
    price: 8900,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85",
    stock: 9,
    color: "hsl(340, 80%, 50%)",
    bgGradient: "from-pink-50 to-purple-50",
  },
  {
    id: "atl-jmp-001",
    name: "Floral Summer Jumpsuit",
    description: "Breezy botanical print jumpsuit in woven viscose with an adjustable tie waist.",
    price: 6000,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85",
    stock: 14,
    color: "hsl(28, 100%, 55%)",
    bgGradient: "from-orange-50 to-amber-50",
  },
];

const initialProductSeeds: any[] = [];

async function seedInitialProducts() {
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: atlasProductSeeds,
    });
    return;
  }

  await Promise.all(
    atlasProductSeeds.map(async (seed) => {
      const product = await prisma.product.findUnique({ where: { id: seed.id } });
      if (!product) {
        // Recreate missing Atlas products
        await prisma.product.create({
          data: seed,
        });
        return;
      }

      const isValidSeedImage = isValidImagePath(product.image);
      if (!isValidSeedImage) {
        await prisma.product.update({
          where: { id: seed.id },
          data: { image: seed.image },
        });
      }
    }),
  );
}

function createToken(userId: string) {
  return jwt.sign({ role: "admin", userId }, JWT_SECRET, { expiresIn: "15m" });
}

function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { role: string; userId: string };
}

function unauthorized(res: Response) {
  return res.status(401).json({ message: "Unauthorized access" });
}

const DEFAULT_SHIPPING_COMPANIES = ["Yalidine", "ZR Express", "Maestro"];

async function ensureShippingCompanies() {
  const count = await prisma.shippingCompany.count();
  if (count === 0) {
    await prisma.shippingCompany.createMany({
      data: DEFAULT_SHIPPING_COMPANIES.map((name) => ({ name, active: true })),
    });
  }
}

async function ensureAdminUser() {
  const ADMIN_EMAIL = "admin@atlas.dz";
  const existing = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existing) {
    await prisma.adminUser.create({
      data: {
        id: "admin-1",
        email: ADMIN_EMAIL,
        name: "Store Admin",
        pfp: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        passwordHash: bcrypt.hashSync("admin123", 10),
      },
    });
  }
}

export function createAdminRouter() {
  const router = express.Router();
  void Promise.all([ensureAdminUser(), seedInitialProducts(), ensureShippingCompanies()]).catch((error) => {
    console.error("Failed to initialize admin backend:", error);
  });

  router.post("/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user.id);
    res.cookie(TOKEN_NAME, token, COOKIE_OPTIONS);
    return res.json(toProfile(user));
  });

  router.post("/auth/logout", (_req: Request, res: Response) => {
    res.cookie(TOKEN_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return res.json({ success: true });
  });

  router.get("/auth/me", async (req: Request, res: Response) => {
    const token = req.cookies[TOKEN_NAME];
    if (!token) {
      return unauthorized(res);
    }
    try {
      const payload = verifyToken(token);
      if (payload.role !== "admin") {
        return unauthorized(res);
      }
      const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } });
      if (!user) {
        return unauthorized(res);
      }
      return res.json(toProfile(user));
    } catch (error) {
      return unauthorized(res);
    }
  });

  router.get("/products", async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: productRelationsInclude,
    });
    return res.json(products);
  });

  router.get("/products/:id", async (req: Request, res: Response) => {
    const productId = getRouteParamId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: "Product id is required." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, include: productRelationsInclude });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json(product);
  });

  router.post("/orders", async (req: Request, res: Response) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const { customerName, phone, address, items, total } = parsed.data;
    const company = typeof req.body.company === "string" ? req.body.company.slice(0, 100) : undefined;
    const deliveryType = req.body.deliveryType === "stopdesk" ? "stopdesk" : undefined;

    try {
      // Validate stock availability
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return res.status(404).json({ message: `Product "${item.name}" not found.` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for "${item.name}". Available: ${product.stock}, Requested: ${item.quantity}` });
        }
      }

      const order = await prisma.order.create({
        data: {
          customerName,
          phone,
          address,
          total,
          status: "pending",
          ...(company ? { shippingCompany: company } : {}),
          ...(deliveryType ? { deliveryType } : {}),
          date: new Date(),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      return res.status(201).json({
        ...order,
        date: order.date.toISOString(),
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create order." });
    }
  });

  router.get("/companies", async (_req: Request, res: Response) => {
    const companies = await prisma.shippingCompany.findMany({ orderBy: { createdAt: "asc" } });
    return res.json(companies);
  });

  router.get("/settings", async (_req: Request, res: Response) => {
    const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    return res.json(settings ?? defaultSettings());
  });

  router.use((req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[TOKEN_NAME];
    if (!token) {
      return unauthorized(res);
    }

    try {
      const payload = verifyToken(token);
      if (payload.role !== "admin") {
        return unauthorized(res);
      }
      res.locals.userId = payload.userId;
      next();
    } catch {
      return unauthorized(res);
    }
  });

  router.get("/users", async (_req: Request, res: Response) => {
    const users = await prisma.adminUser.findMany();
    return res.json(users.map(toProfile));
  });

  router.post("/users", async (req: Request, res: Response) => {
    const userSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters.").regex(/[0-9]/, "Password must contain at least one number."),
      pfp: z.string().url().optional().default("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"),
    });
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const existingUser = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newUser = await prisma.adminUser.create({
      data: {
        id,
        email: parsed.data.email,
        name: parsed.data.name,
        pfp: parsed.data.pfp,
        passwordHash: bcrypt.hashSync(parsed.data.password, 10),
      },
    });
    return res.status(201).json(toProfile(newUser));
  });

  router.delete("/users/:id", async (req: Request, res: Response) => {
    const userId = res.locals.userId as string;
    const targetId = getRouteParamId(req.params.id);
    if (!targetId) {
      return res.status(400).json({ message: "Admin id is required." });
    }
    if (targetId === userId) {
      return res.status(400).json({ message: "Cannot delete the current signed-in admin." });
    }

    const user = await prisma.adminUser.findUnique({ where: { id: targetId } });
    if (!user) {
      return res.status(404).json({ message: "Admin not found." });
    }
    await prisma.adminUser.delete({ where: { id: targetId } });
    return res.json({ success: true });
  });

  router.put("/auth/me", async (req: Request, res: Response) => {
    const userId = res.locals.userId as string;
    const userSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      pfp: z.string().url(),
      password: z.string().min(8, "Password must be at least 8 characters.").regex(/[0-9]/, "Password must contain at least one number.").optional(),
    });
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const existingEmail = await prisma.adminUser.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: userId },
      },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        pfp: parsed.data.pfp,
        ...(parsed.data.password ? { passwordHash: bcrypt.hashSync(parsed.data.password, 10) } : {}),
      },
    });
    return res.json(toProfile(updatedUser));
  });

  router.post("/products", async (req: Request, res: Response) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newProduct = await prisma.product.create({
      data: {
        id,
        ...normalizeProductData(parsed.data),
      },
    });
    await saveProductRelations(id, parsed.data);

    const withRelations = await prisma.product.findUnique({ where: { id }, include: productRelationsInclude });
    return res.status(201).json(withRelations ?? newProduct);
  });

  router.put("/products/:id", async (req: Request, res: Response) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const productId = getRouteParamId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: "Product id is required." });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: normalizeProductData(parsed.data),
    });
    await saveProductRelations(productId, parsed.data);
    const withRelations = await prisma.product.findUnique({
      where: { id: productId },
      include: productRelationsInclude,
    });
    return res.json(withRelations ?? updatedProduct);
  });

  router.delete("/products/:id", async (req: Request, res: Response) => {
    const productId = getRouteParamId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: "Product id is required." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    await prisma.product.delete({ where: { id: productId } });
    return res.json({ success: true });
  });

  router.get("/orders", async (_req: Request, res: Response) => {
    const orders = await prisma.order.findMany({ include: { items: true } }) as Array<{ date: Date; items: unknown[] | undefined; [key: string]: unknown }>;
    return res.json(
      orders.map((order) => ({
        ...order,
        products: order.items,
        date: order.date.toISOString(),
      })),
    );
  });

  router.patch("/orders/:id/status", async (req: Request, res: Response) => {
    const parsed = orderPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const orderId = getRouteParamId(req.params.id);
    if (!orderId) {
      return res.status(400).json({ message: "Order id is required." });
    }

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    const data: { status?: string; shippingCompany?: string | null; deliveryType?: string } = {};
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.company !== undefined) data.shippingCompany = parsed.data.company || null;
    if (parsed.data.deliveryType !== undefined) data.deliveryType = parsed.data.deliveryType;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { items: true },
    });

    return res.json({
      ...updatedOrder,
      date: updatedOrder.date.toISOString(),
    });
  });

  router.post("/companies", async (req: Request, res: Response) => {
    const parsed = companySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const name = parsed.data.name.trim();
    const existing = await prisma.shippingCompany.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "This company already exists." });
    }
    const created = await prisma.shippingCompany.create({
      data: { name, active: parsed.data.active ?? true },
    });
    return res.status(201).json(created);
  });

  router.patch("/companies/:id", async (req: Request, res: Response) => {
    const companyId = getRouteParamId(req.params.id);
    if (!companyId) {
      return res.status(400).json({ message: "Company id is required." });
    }
    const parsed = z
      .object({
        name: z.string().min(2).max(100).optional(),
        active: z.boolean().optional(),
      })
      .refine((d) => d.name !== undefined || d.active !== undefined, {
        message: "Nothing to update.",
      })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const existing = await prisma.shippingCompany.findUnique({ where: { id: companyId } });
    if (!existing) {
      return res.status(404).json({ message: "Company not found." });
    }
    if (parsed.data.name !== undefined) {
      const nameTaken = await prisma.shippingCompany.findUnique({ where: { name: parsed.data.name.trim() } });
      if (nameTaken && nameTaken.id !== companyId) {
        return res.status(400).json({ message: "This company already exists." });
      }
    }
    const updated = await prisma.shippingCompany.update({
      where: { id: companyId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
      },
    });
    return res.json(updated);
  });

  router.delete("/companies/:id", async (req: Request, res: Response) => {
    const companyId = getRouteParamId(req.params.id);
    if (!companyId) {
      return res.status(400).json({ message: "Company id is required." });
    }
    const existing = await prisma.shippingCompany.findUnique({ where: { id: companyId } });
    if (!existing) {
      return res.status(404).json({ message: "Company not found." });
    }
    await prisma.shippingCompany.delete({ where: { id: companyId } });
    return res.json({ success: true });
  });

  function defaultSettings() {
    return {
      id: "default",
      storeName: "Atlas",
      logo: null,
      favicon: null,
      description: null,
      contactEmail: null,
      phone: null,
      address: null,
      currency: "DZD",
      currencySymbol: "DA",
      defaultCountry: "Algeria",
      defaultLanguage: "fr",
      deliveryEnabled: true,
      defaultDeliveryFee: 0,
      freeDeliveryThreshold: null,
      codEnabled: true,
      defaultOrderStatus: "pending",
    };
  }

  router.put("/settings", async (req: Request, res: Response) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    // Normalize blank optional text fields to null
    for (const key of ["logo", "favicon", "description", "contactEmail", "phone", "address"] as const) {
      if ((parsed.data as Record<string, unknown>)[key] === "") {
        (parsed.data as Record<string, unknown>)[key] = null;
      }
    }
    const updated = await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...parsed.data },
      update: parsed.data,
    });
    return res.json(updated);
  });

  return router;
}
