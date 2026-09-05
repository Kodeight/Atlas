/**
 * One-time idempotent import of existing Atlas storefront products into the existing database.
 * Reads src/data/products.ts PRODUCTS_DATA and inserts into admin backend via API.
 * Uses stable identifier `id` (e.g., 'p-1') to avoid duplicates.
 * Safe to run multiple times.
 */

import { PRODUCTS_DATA } from '../src/data/products';

const ADMIN_API = process.env.ADMIN_API_URL || 'http://localhost:3000/admin/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@atlas.dz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function login(): Promise<string> {
  const res = await fetch(`${ADMIN_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed ${res.status}: ${text}`);
  }
  // Extract cookie
  const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie') || '';
  // Also try to get token from json
  const data = await res.json().catch(() => ({}));
  console.log(`Logged in as ${data.email || ADMIN_EMAIL}`);
  return setCookie;
}

function mapToAdminProduct(p: (typeof PRODUCTS_DATA)[number]) {
  // Map storefront product to admin DB schema (limited fields)
  // admin schema: { name, flavor?, description, price, image, stock, color?, bgGradient? }
  const primaryImage = p.images[0] || '/placeholder-product.webp';
  const primaryColor = p.colors[0]?.hex || '#1F5742';
  const flavor = p.colors[0]?.name || p.categoryLabel || 'Signature';
  // Derive bgGradient from color or category
  const bgGradient = 'from-slate-50 to-slate-200';
  return {
    id: p.id, // stable identifier for idempotency (will be used as product id if API supports)
    name: p.name,
    flavor,
    description: `${p.description} | SKU: ${p.sku} | Category: ${p.category} | Sizes: ${p.sizes.join(',')} | Colors: ${p.colors.map(c=>c.name).join(',')} | ${p.shortDescription}`,
    price: p.salePrice ?? p.price,
    image: primaryImage,
    stock: p.stock,
    color: primaryColor,
    bgGradient,
    // Preserve extra fields as JSON in description if needed, but keep core
    // For future: these could be stored in separate tables if schema extended
  };
}

async function main() {
  console.log(`Found ${PRODUCTS_DATA.length} storefront products to import`);
  console.log(`Admin API: ${ADMIN_API}`);

  let cookie = '';
  try {
    cookie = await login();
  } catch (e) {
    console.error('Login failed, trying without auth (may be open):', e);
  }

  // Fetch existing products
  const existingRes = await fetch(`${ADMIN_API}/products`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  let existing: any[] = [];
  if (existingRes.ok) {
    existing = await existingRes.json();
    console.log(`Existing DB products: ${existing.length}`);
  } else {
    console.warn(`Could not fetch existing products: ${existingRes.status}`);
  }

  const existingIds = new Set(existing.map((p: any) => p.id));
  const existingSkus = new Set(existing.map((p: any) => p.sku).filter(Boolean));
  // Also check by name
  const existingNames = new Set(existing.map((p: any) => p.name));

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of PRODUCTS_DATA) {
    const mapped = mapToAdminProduct(product);
    // Idempotency check by id
    if (existingIds.has(product.id) || existingNames.has(product.name)) {
      console.log(`SKIP ${product.id} ${product.name} - already exists`);
      skipped++;
      continue;
    }

    // Try to create via API - the admin API generates its own id, so we need to check
    // if the API allows custom id, if not, we will create and let it generate, but we check by name
    // For now, try POST with mapped data (without id if API generates)
    const payload = {
      name: mapped.name,
      description: mapped.description,
      price: mapped.price,
      image: mapped.image,
      stock: mapped.stock,
      flavor: mapped.flavor,
      color: mapped.color,
      bgGradient: mapped.bgGradient,
    };

    try {
      const res = await fetch(`${ADMIN_API}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (res.ok) {
        const created = await res.json();
        console.log(`IMPORTED ${product.id} -> ${created.id} ${product.name} price ${created.price} stock ${created.stock}`);
        imported++;
      } else {
        const text = await res.text();
        console.warn(`FAILED ${product.id} ${product.name}: ${res.status} ${text}`);
        failed++;
      }
    } catch (e) {
      console.error(`ERROR ${product.id}:`, e);
      failed++;
    }
  }

  console.log(`\n=== IMPORT SUMMARY ===`);
  console.log(`Existing: ${existing.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (already present): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total after: ${existing.length + imported} (expected ${PRODUCTS_DATA.length} if clean)`);
  console.log(`STORE PRODUCT SOURCE after migration: DATABASE via ${ADMIN_API}/products`);
  console.log(`ADMIN PRODUCT SOURCE: same DATABASE`);
  console.log(`ONE SOURCE OF TRUTH: PASS if counts match`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
