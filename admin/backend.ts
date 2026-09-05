/// <reference path="./bcryptjs.d.ts" />
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "xcCuJMhPBtPz3cAdYGJBllHjFlEsCPREy4d8BqV3IQK";
const APP_URL = process.env.APP_URL || "";
const TOKEN_NAME = "zest_admin_token";

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

function normalizeProductData(data: z.infer<typeof productSchema>) {
  const theme = defaultProductTheme(data.name);
  return {
    ...data,
    flavor: data.flavor || deriveFlavor(data.name),
    color: data.color || theme.color,
    bgGradient: data.bgGradient || theme.bgGradient,
  };
}

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
  flavor: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  image: z.string().min(1).refine(isValidImagePath, {
    message: "Image must be a valid URL or local path.",
  }),
  stock: z.number().int().nonnegative(),
  color: z.string().optional(),
  bgGradient: z.string().optional(),
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

const ADMIN_EMAIL = "admin@zest.com";

const atlasProductSeeds = [
  {
    id: "atl-blz-004",
    name: "Relaxed Tailored Blazer",
    description: "Single-breasted fluid wool-blend blazer with structured lapels and clean welt pockets.",
    price: 9500,
    image: "/blazer-front.webp",
    stock: 16,
    color: "hsl(210, 20%, 35%)",
    bgGradient: "from-slate-50 to-slate-200",
  },
  {
    id: "atl-tee-007",
    name: "Classic Cotton Crewneck T-Shirt",
    description: "Heavyweight 240 GSM combed cotton tee with ribbed collar and relaxed drape.",
    price: 3200,
    image: "/tee-white.webp",
    stock: 35,
    color: "hsl(0, 0%, 100%)",
    bgGradient: "from-slate-50 to-slate-200",
  },
  {
    id: "atl-shr-002",
    name: "Oversized Linen Shirt",
    description: "Pure European flax linen shirt with a relaxed dropped-shoulder silhouette.",
    price: 5200,
    image: "/linen-shirt-natural.webp",
    stock: 22,
    color: "hsl(48, 95%, 55%)",
    bgGradient: "from-yellow-50 to-amber-50",
  },
  {
    id: "atl-drs-003",
    name: "Satin Pleated Evening Dress",
    description: "Lustrous emerald satin maxi dress featuring fine sunburst accordion pleats.",
    price: 8900,
    image: "/satin-dress.webp",
    stock: 9,
    color: "hsl(340, 80%, 50%)",
    bgGradient: "from-pink-50 to-purple-50",
  },
  {
    id: "atl-jmp-001",
    name: "Floral Summer Jumpsuit",
    description: "Breezy botanical print jumpsuit in woven viscose with an adjustable tie waist.",
    price: 6000,
    image: "/jumpsuit-floral.webp",
    stock: 14,
    color: "hsl(28, 100%, 55%)",
    bgGradient: "from-orange-50 to-amber-50",
  },
];

const initialProductSeeds = [
}

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

async function ensureAdminUser() {
  const ADMIN_EMAIL = "admin@zest.com";
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
  void Promise.all([ensureAdminUser(), seedInitialProducts()]).catch((error) => {
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
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(products);
  });

  router.get("/products/:id", async (req: Request, res: Response) => {
    const productId = getRouteParamId(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: "Product id is required." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
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

    return res.status(201).json(newProduct);
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
    return res.json(updatedProduct);
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
    const parsed = statusSchema.safeParse(req.body);
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

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: parsed.data.status },
      include: { items: true },
    });

    return res.json({
      ...updatedOrder,
      date: updatedOrder.date.toISOString(),
    });
  });

  return router;
}
