// Conservative category suggestion (men/women only).
// Word-boundary keyword matching on title + description — never substrings,
// never auto-saved. The admin always accepts, changes, or ignores the result.

export interface SuggestableCategory {
  id: string;
  slug: string;
  enabled?: boolean;
}

const MEN_WORDS = ['men', "men's", 'mens', 'homme', 'hommes', 'male', "homme's"];
const WOMEN_WORDS = ['women', "women's", 'womens', 'femme', 'femmes', 'female'];

function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')} `;
}

function hits(text: string, words: string[]): number {
  let count = 0;
  for (const w of words) {
    const pattern = new RegExp(`\\b${w.replace(/'/g, "'?")}\\b`);
    if (pattern.test(text)) count++;
  }
  return count;
}

/**
 * Suggest a 'men' or 'women' category slug, or null when confidence is low
 * (both sides hit, neither hits, or the category is missing/disabled).
 */
export function suggestCategory(
  name: string,
  description: string,
  categories: SuggestableCategory[],
): string | null {
  const text = normalize(`${name || ''} ${description || ''}`);
  const men = hits(text, MEN_WORDS);
  const women = hits(text, WOMEN_WORDS);
  if (men > 0 && women > 0) return null;
  if (men === 0 && women === 0) return null;
  const want = men > 0 ? 'men' : 'women';
  const found = categories.find((c) => c.slug === want && c.enabled !== false);
  return found ? found.slug : null;
}
