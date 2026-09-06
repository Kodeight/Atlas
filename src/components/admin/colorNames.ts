// Color-name → hex recognition for the product editor (English + French).
// Lets admins type "Noir" instead of "#111111". Used client-side to auto-fill
// the hex field and server-side as a forgiving fallback. Keep lists in sync
// with the copies in admin/backend.ts and api/admin/products.ts.

const ENTRIES: [string, string][] = [
  ['black', '#111111'],
  ['noir', '#111111'],
  ['white', '#FFFFFF'],
  ['blanc', '#FFFFFF'],
  ['blanche', '#FFFFFF'],
  ['off white', '#F3EFE6'],
  ['ecru', '#F3EFE6'],
  ['écru', '#F3EFE6'],
  ['cream', '#F3EFE6'],
  ['creme', '#F3EFE6'],
  ['crème', '#F3EFE6'],
  ['ivory', '#FFFFF0'],
  ['ivoire', '#FFFFF0'],
  ['beige', '#D8C8AD'],
  ['sand', '#E4DDD2'],
  ['sable', '#E4DDD2'],
  ['taupe', '#B8A89A'],
  ['camel', '#C19A6B'],
  ['brown', '#6B4F3A'],
  ['marron', '#6B4F3A'],
  ['chocolate', '#4A3226'],
  ['chocolat', '#4A3226'],
  ['grey', '#8A8F98'],
  ['gray', '#8A8F98'],
  ['gris', '#8A8F98'],
  ['grise', '#8A8F98'],
  ['charcoal', '#2B2E33'],
  ['anthracite', '#2B2E33'],
  ['navy', '#1F3350'],
  ['marine', '#1F3350'],
  ['blue', '#3B6E8C'],
  ['bleu', '#3B6E8C'],
  ['bleue', '#3B6E8C'],
  ['light blue', '#A8C3D1'],
  ['bleu clair', '#A8C3D1'],
  ['denim', '#4A6582'],
  ['jean', '#4A6582'],
  ['green', '#2E7D4F'],
  ['vert', '#2E7D4F'],
  ['verte', '#2E7D4F'],
  ['atlas green', '#1F5742'],
  ['vert atlas', '#1F5742'],
  ['emerald', '#046A38'],
  ['emeraude', '#046A38'],
  ['émeraude', '#046A38'],
  ['olive', '#6B7043'],
  ['khaki', '#C3B091'],
  ['kaki', '#C3B091'],
  ['mint', '#A8D5BA'],
  ['menthe', '#A8D5BA'],
  ['teal', '#2A7F7F'],
  ['sarcelle', '#2A7F7F'],
  ['turquoise', '#40C4C4'],
  ['yellow', '#E8C547'],
  ['jaune', '#E8C547'],
  ['mustard', '#D1A43A'],
  ['moutarde', '#D1A43A'],
  ['orange', '#E07B39'],
  ['terracotta', '#C96F4A'],
  ['red', '#C0392B'],
  ['rouge', '#C0392B'],
  ['bordeaux', '#6E1423'],
  ['burgundy', '#6E1423'],
  ['pink', '#E8A598'],
  ['rose', '#E8A598'],
  ['fuchsia', '#C13572'],
  ['coral', '#F08080'],
  ['corail', '#F08080'],
  ['salmon', '#FA8072'],
  ['saumon', '#FA8072'],
  ['peach', '#FFDAB9'],
  ['peche', '#FFDAB9'],
  ['pêche', '#FFDAB9'],
  ['purple', '#7B5EA7'],
  ['violet', '#7B5EA7'],
  ['violette', '#7B5EA7'],
  ['lilac', '#C8A2C8'],
  ['lilas', '#C8A2C8'],
  ['gold', '#D6BA8E'],
  ['dore', '#D6BA8E'],
  ['doré', '#D6BA8E'],
  ['doree', '#D6BA8E'],
  ['dorée', '#D6BA8E'],
  ['silver', '#C0C0C0'],
  ['argent', '#C0C0C0'],
  ['argentee', '#C0C0C0'],
  ['argentée', '#C0C0C0'],
  ['champagne', '#EFE3C8'],
];

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

const MAP = new Map<string, string>();
for (const [name, hex] of ENTRIES) {
  if (!MAP.has(name)) MAP.set(name, hex);
}

/** Recognize a hex code from an English/French color name. Returns null when unknown. */
export function recognizeHex(name: string | null | undefined): string | null {
  if (!name) return null;
  return MAP.get(normalizeName(name)) ?? null;
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}
