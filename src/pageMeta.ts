import { Language } from './i18n/translations';

export const SITE_TITLE = 'Atlas — Fashion & Clothing';
const SUFFIX = '— Atlas';

export interface TitleProduct {
  name: string;
  shortDescription?: string;
}

/**
 * Pure page-title resolver (testable without a browser).
 * Returns null for /admin* — the AdminPage owns that title (tab-aware).
 * Unknown paths render the 404 page, hence the not-found title.
 */
export function getPageTitle(
  path: string,
  lang: Language,
  findProduct?: (slug: string) => TitleProduct | undefined,
): string | null {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  if (path === '/' || path === '') return SITE_TITLE;
  if (path === '/shop') return `${t('Boutique', 'Shop')} ${SUFFIX}`;
  if (path.startsWith('/category/')) {
    const key = path.replace('/category/', '').split('/')[0];
    const known: Record<string, [string, string]> = {
      women: ['Femmes', 'Women'],
      men: ['Hommes', 'Men'],
      sale: ['Soldes', 'Sale'],
    };
    const hit = known[key];
    return `${hit ? t(hit[0], hit[1]) : t('Boutique', 'Shop')} ${SUFFIX}`;
  }
  if (path.startsWith('/product/')) {
    const slug = path.replace('/product/', '').split('?')[0];
    const product = slug ? findProduct?.(slug) : undefined;
    if (product && product.name) return `${product.name} ${SUFFIX}`;
    return SITE_TITLE;
  }
  if (path === '/cart') return `${t('Panier', 'Cart')} ${SUFFIX}`;
  if (path.startsWith('/order-confirmation/')) {
    return `${t('Confirmation de commande', 'Order Confirmation')} ${SUFFIX}`;
  }
  if (path === '/about') return `${t('Maison Atlas', 'About Atlas')} ${SUFFIX}`;
  if (path === '/contact') return `Contact ${SUFFIX}`;
  if (path === '/shipping') return `${t('Livraison', 'Shipping')} ${SUFFIX}`;
  if (path === '/size-guide') return `${t('Guide des tailles', 'Size Guide')} ${SUFFIX}`;
  if (path === '/faq') return `FAQ ${SUFFIX}`;
  if (path === '/login') return `${t('Connexion', 'Login')} ${SUFFIX}`;
  if (path === '/admin' || path.startsWith('/admin/')) return null;
  return t('Page introuvable — Atlas', 'Page Not Found — Atlas');
}

let cachedDefaultDescription: string | null = null;

/** Applies title + product meta description; call only in the browser. */
export function applyPageMeta(title: string | null, description?: string) {
  if (title !== null) document.title = title;
  const tag = document.querySelector('meta[name="description"]');
  if (!tag) return;
  if (cachedDefaultDescription === null) {
    cachedDefaultDescription = tag.getAttribute('content') || '';
  }
  tag.setAttribute('content', description || cachedDefaultDescription);
}
