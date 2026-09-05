/**
 * Image service for Atlas Fashion.
 * Centralizes authoritative brand assets and curated fashion photography.
 */

import type { SyntheticEvent } from 'react';

export const ATLAS_OFFICIAL_LOGO = {
  local: '/assets/atlas-logo.png',
  remote: 'https://atlasdz.ifree.page/wp-content/uploads/2026/07/cropped-atlas_logo_officiel-removebg-preview-216x85.png',
  favicon: 'https://atlasdz.ifree.page/wp-content/uploads/2026/07/ATLAS-logo-2.png',
  alt: 'ATLAS Fashion',
  width: 216,
  height: 85,
};

// Curated high-resolution fashion photography with clean editorial aesthetic
export const FASHION_EDITORIAL_IMAGES = {
  heroModel: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
  heroSecondary: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
  editorialFeature1: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85',
  editorialFeature2: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
  categoryWomen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
  categoryMen: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
  categoryNew: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=85',
  categorySale: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1000&q=85',
  aboutStory: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85',
  workshopCraft: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85',
};

export function getLogoUrl(): string {
  return ATLAS_OFFICIAL_LOGO.local;
}

export function handleImageError(e: SyntheticEvent<HTMLImageElement, Event>, fallbackUrl: string) {
  const target = e.currentTarget;
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}
