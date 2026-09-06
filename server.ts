import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createAdminRouter } from './admin/backend.ts';
import { PRODUCTS_DATA } from './src/data/products.ts';
import { ALGERIAN_WILAYAS } from './src/data/wilayas.ts';
import { PrismaClient } from '@prisma/client';

let prisma: any;
try {
  prisma = new PrismaClient();
} catch {
  prisma = {
    product: {
      findMany: async () => [],
    },
  };
}

const REL_INCLUDE = {
  colors: { orderBy: { position: 'asc' as const } },
  sizes: { orderBy: { position: 'asc' as const } },
  images: { orderBy: { position: 'asc' as const } },
};

function mapDbProductToStorefront(dbProduct: any) {
  // DB product has: id, name, description, price, image, stock, color, bgGradient, flavor
  // plus optional relations (colors / sizes / images) and galleryEnabled.
  // Legacy single-value fallbacks keep products without relations working.
  const slug = dbProduct.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  const relColors: any[] = Array.isArray(dbProduct.colors) ? dbProduct.colors : [];
  const relSizes: any[] = Array.isArray(dbProduct.sizes) ? dbProduct.sizes : [];
  const relImages: any[] = Array.isArray(dbProduct.images) ? dbProduct.images : [];
  const galleryEnabled = dbProduct.galleryEnabled === true && relImages.length > 0;
  const galleryUrls = relImages.map((g: any) => g.url).filter((u: any) => typeof u === 'string' && u.length > 0);
  const colorNameById = new Map<string, string>();
  for (const c of relColors) {
    if (c && c.id) {
      const shown = typeof c.name === 'string' && c.name.trim() ? c.name.trim() : null;
      const hex = typeof c.hex === 'string' && c.hex ? c.hex : '#1F5742';
      colorNameById.set(c.id, shown || hex);
    }
  }
  const colors =
    relColors.length > 0
      ? relColors.map((c: any) => {
          const shown = typeof c.name === 'string' && c.name.trim() ? c.name.trim() : null;
          const hex = typeof c.hex === 'string' && c.hex ? c.hex : '#1F5742';
          const entry: { name: string; displayName: string | null; hex: string; imageIndex?: number } = {
            name: shown || hex,
            displayName: shown,
            hex,
          };
          const galleryIdx = relImages.findIndex((g: any) => g.colorId && g.colorId === c.id);
          if (galleryEnabled && galleryIdx >= 0) entry.imageIndex = 1 + galleryIdx;
          return entry;
        })
      : [
          {
            name: dbProduct.flavor || 'Default',
            displayName: dbProduct.flavor || 'Default',
            hex: dbProduct.color || '#1F5742',
            imageIndex: 0,
          },
        ];
  const enabledSizes = relSizes.filter((s: any) => s && s.enabled !== false && typeof s.label === 'string');
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug,
    description: dbProduct.description,
    shortDescription: dbProduct.description.split('|')[0].trim().split('.')[0] + '.',
    category: 'women' as const,
    categoryLabel: 'Women',
    price: dbProduct.price,
    salePrice: undefined,
    images: galleryEnabled && galleryUrls.length > 0 ? [dbProduct.image, ...galleryUrls].filter(Boolean) : [dbProduct.image],
    galleryEnabled,
    gallery: galleryEnabled
      ? relImages.map((g: any) => ({
          url: g.url,
          alt: typeof g.alt === 'string' ? g.alt : undefined,
          colorName: g.colorId ? colorNameById.get(g.colorId) : undefined,
        }))
      : undefined,
    sizes: enabledSizes.length > 0 || relSizes.length > 0 ? enabledSizes.map((s: any) => s.label) : ['S', 'M', 'L'],
    sizeOptions:
      relSizes.length > 0
        ? relSizes.map((s: any) => ({
            size: s.label,
            inStock: s.enabled !== false && (s.stock == null || s.stock > 0),
            stockCount: typeof s.stock === 'number' ? s.stock : undefined,
          }))
        : undefined,
    colors,
    stock: dbProduct.stock,
    sku: `ATL-${dbProduct.id}`,
    isSale: false,
    isFeatured: false,
    isNew: false,
    rating: 4.5,
    reviewsCount: 0,
  };
}

async function getProductsFromDbOrFallback() {
  try {
    const dbProducts = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, include: REL_INCLUDE });
    if (dbProducts.length > 0) {
      return dbProducts.map(mapDbProductToStorefront);
    }
  } catch (e) {
    console.warn('Could not fetch products from DB, using fallback:', e);
  }
  return PRODUCTS_DATA;
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cookieParser());
app.use(express.json());
// Admin API - must be before static serving for Vercel production
app.use('/admin/api', createAdminRouter());

// In-memory persistent order storage for the server session
const storedOrders: Map<string, any> = new Map();

// Helper to calculate delivery fee server-side
function calculateDeliveryServer(wilayaCode: string, subtotal: number) {
  const wilaya = ALGERIAN_WILAYAS.find((w) => w.code === wilayaCode) || ALGERIAN_WILAYAS.find((w) => w.code === '16')!;
  const isFree = subtotal >= 20000;
  return {
    wilayaCode: wilaya.code,
    wilayaName: wilaya.name,
    deliveryFee: isFree ? 0 : wilaya.deliveryFee,
    estimatedDays: wilaya.estimatedDays,
    freeDeliveryEligible: isFree,
  };
}

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', brand: 'ATLAS Fashion', time: new Date().toISOString() });
});

app.get('/api/products', async (_req: Request, res: Response) => {
  const products = await getProductsFromDbOrFallback();
  res.json({ products });
});

app.get('/api/products/:slug', async (req: Request, res: Response) => {
  const products = await getProductsFromDbOrFallback();
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

app.get('/api/wilayas', (_req: Request, res: Response) => {
  res.json({ wilayas: ALGERIAN_WILAYAS });
});

app.post('/api/calculate-delivery', (req: Request, res: Response) => {
  const { wilayaCode, subtotal } = req.body;
  const result = calculateDeliveryServer(wilayaCode, Number(subtotal) || 0);
  res.json(result);
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const { customer, items } = req.body;

  if (!customer || !customer.fullName || !customer.phone || !customer.wilayaCode || !customer.commune || !customer.address) {
    return res.status(400).json({ error: 'Please provide all required delivery information (Name, Phone, Wilaya, Commune, Address).' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  // Server-side recalculation and validation - use DB as source of truth
  const allProducts = await getProductsFromDbOrFallback();
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = allProducts.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ID ${item.productId} was not found.` });
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const unitPrice = product.salePrice ?? product.price;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    const colorObj = product.colors.find((c) => c.name === item.colorName) || product.colors[0];
    const image = product.images[colorObj?.imageIndex ?? 0] || product.images[0];

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      productImage: image,
      size: item.size || 'Standard',
      color: colorObj?.name || 'Standard',
      colorHex: colorObj?.hex || '#1F5742',
      quantity: qty,
      unitPrice,
      totalPrice: lineTotal,
    });
  }

  const delivery = calculateDeliveryServer(customer.wilayaCode, subtotal);
  const total = subtotal + delivery.deliveryFee;

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderId = `#AT-${randomNum}`;

  const order = {
    orderId,
    customer: {
      ...customer,
      wilayaName: delivery.wilayaName,
    },
    items: validatedItems,
    subtotal,
    deliveryFee: delivery.deliveryFee,
    total,
    paymentMethod: 'CASH_ON_DELIVERY',
    orderStatus: 'PENDING_CONFIRMATION',
    createdAt: new Date().toISOString(),
  };

  storedOrders.set(orderId, order);
  console.log(`[Order Created] ${orderId} for ${customer.fullName} (${delivery.wilayaName}) - Total: ${total} DA`);

  res.status(201).json({ success: true, order });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const orderId = req.params.id.startsWith('#') ? req.params.id : `#${req.params.id}`;
  const order = storedOrders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ATLAS Fashion server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
