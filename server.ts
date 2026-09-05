import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createAdminRouter } from './admin/backend.ts';
import { PRODUCTS_DATA } from './src/data/products.ts';
import { ALGERIAN_WILAYAS } from './src/data/wilayas.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

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

app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ products: PRODUCTS_DATA });
});

app.get('/api/products/:slug', (req: Request, res: Response) => {
  const product = PRODUCTS_DATA.find((p) => p.slug === req.params.slug);
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

app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items } = req.body;

  if (!customer || !customer.fullName || !customer.phone || !customer.wilayaCode || !customer.commune || !customer.address) {
    return res.status(400).json({ error: 'Please provide all required delivery information (Name, Phone, Wilaya, Commune, Address).' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  // Server-side recalculation and validation
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = PRODUCTS_DATA.find((p) => p.id === item.productId);
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
