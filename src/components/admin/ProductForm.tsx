import React, { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { adminText, AdminLang } from './adminText';
import { compressImageFile, isSupportedImage } from './imageUpload';
import { isValidHex, recognizeHex } from './colorNames';
import { suggestCategory } from './categorySuggest';

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  nameFr?: string | null;
}

const FALLBACK_HEX = '#1F5742';

function resolveHex(name: string, nameFr: string, hex: string): string {
  if (isValidHex(hex)) return hex;
  return recognizeHex(name) ?? recognizeHex(nameFr) ?? FALLBACK_HEX;
}
import { ColorManager, ColorRow, blankColor } from './ColorManager';
import { SizeManager, SizeRow, blankSize } from './SizeManager';
import { GalleryManager, GalleryRow } from './GalleryManager';

export interface AdminProduct {
  id: string;
  name: string;
  nameFr?: string;
  flavor?: string;
  flavorFr?: string;
  description: string;
  descriptionFr?: string;
  price: number;
  compareAtPrice?: number | null;
  isNew?: boolean;
  image: string;
  stock: number;
  color?: string;
  bgGradient?: string;
  galleryEnabled?: boolean;
  categoryId?: string | null;
  category?: { id: string; slug: string } | null;
  colors?: { id: string; name?: string | null; nameFr?: string | null; hex: string; label?: string | null }[];
  sizes?: { id: string; label: string; enabled: boolean; stock?: number | null }[];
  images?: { id: string; url: string; alt?: string | null; colorId?: string | null }[];
}

export interface ProductFormValue {
  categoryId: string | null;
  compareAtPrice: number | null;
  isNew: boolean;
  name: string;
  nameFr?: string;
  flavor: string;
  flavorFr?: string;
  description: string;
  descriptionFr?: string;
  price: number;
  image: string;
  stock: number;
  galleryEnabled: boolean;
  colors: { key?: string; name: string; nameFr?: string; hex: string; label?: string }[];
  sizes: { key?: string; label: string; enabled: boolean; stock: number | null }[];
  images: { key?: string; url: string; alt?: string; colorKey?: string }[];
}

interface ProductFormProps {
  product?: AdminProduct | null;
  lang: AdminLang;
  categories: CategoryOption[];
  onSubmit: (value: ProductFormValue) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

interface FormState {
  name: string;
  nameFr: string;
  flavor: string;
  flavorFr: string;
  description: string;
  descriptionFr: string;
  price: number;
  image: string;
  stock: number;
  galleryEnabled: boolean;
  categoryId: string | null;
  onSale: boolean;
  compareAt: number;
  isNew: boolean;
}

const emptyForm: FormState = {
  name: '',
  nameFr: '',
  flavor: '',
  flavorFr: '',
  description: '',
  descriptionFr: '',
  price: 0,
  image: '',
  stock: 0,
  galleryEnabled: false,
  categoryId: null,
  onSale: false,
  compareAt: 0,
  isNew: false,
};

const inputClass =
  'w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm text-[#151515] font-sans-ui outline-none transition-colors focus:border-[#1F5742] placeholder:text-[#6D6D6D]/60';

const blankToUndefined = (v: string) => (v.trim().length > 0 ? v.trim() : undefined);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="rounded-lg border border-[#E7E3DA] bg-white overflow-hidden"
    >
      <summary className="px-5 py-3.5 text-sm font-semibold text-[#151515] font-sans-ui cursor-pointer list-none flex items-center justify-between hover:bg-[#F7F3EA] transition-colors focus-visible:outline-2 focus-visible:outline-[#1F5742]">
        {title}
        <span aria-hidden="true" className="text-[#6D6D6D] text-xs">▾</span>
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-[#E7E3DA]/60">{children}</div>
    </details>
  );
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, lang, categories, onSubmit, onCancel, saving }) => {
  const t = adminText[lang];
  const [form, setForm] = useState<FormState>(emptyForm);
  const [colors, setColors] = useState<ColorRow[]>([]);
  const [sizes, setSizes] = useState<SizeRow[]>([]);
  const [gallery, setGallery] = useState<GalleryRow[]>([]);
  const [outOfStock, setOutOfStock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        nameFr: product.nameFr || '',
        flavor: product.flavor || '',
        flavorFr: product.flavorFr || '',
        description: product.description,
        descriptionFr: product.descriptionFr || '',
        price: product.price,
        image: product.image,
        stock: product.stock,
        galleryEnabled: product.galleryEnabled === true,
        categoryId: product.categoryId || null,
        onSale: typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price,
        compareAt:
          typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
            ? product.compareAtPrice
            : product.price,
        isNew: product.isNew === true,
      });
      setColors(
        (product.colors || []).map((c) => ({
          key: c.id,
          name: c.name || '',
          nameFr: c.nameFr || '',
          hex: c.hex,
          label: c.label || '',
        })),
      );
      setSizes(
        (product.sizes || []).map((s) => ({
          key: s.id,
          label: s.label,
          enabled: s.enabled !== false,
          stock: typeof s.stock === 'number' ? s.stock : null,
        })),
      );
      setGallery(
        (product.images || []).map((g) => ({
          key: g.id,
          url: g.url,
          alt: g.alt || '',
          colorKey: g.colorId || '',
        })),
      );
      setOutOfStock(product.stock <= 0);
    } else {
      setForm(emptyForm);
      setColors([]);
      setSizes([]);
      setGallery([]);
      setOutOfStock(false);
    }
    setError(null);
  }, [product]);

  const set = (field: keyof FormState, value: string | number | boolean | null) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Live, conservative suggestion from the typed title/description.
  // Never auto-saves: the admin applies it explicitly, or ignores it.
  const suggestedSlug = React.useMemo(
    () => suggestCategory(form.name, form.description, categories),
    [form.name, form.description, categories],
  );
  const currentSlug = categories.find((c) => c.id === form.categoryId)?.slug;
  const suggestedCategory = suggestedSlug && suggestedSlug !== currentSlug
    ? categories.find((c) => c.slug === suggestedSlug)
    : undefined;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!isSupportedImage(file)) {
      setError(t.eFile);
      return;
    }
    try {
      set('image', await compressImageFile(file));
      setError(null);
    } catch {
      setError(t.eImageTooBig);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 3) {
      setError(t.eName);
      return;
    }
    if (form.description.trim().length < 10) {
      setError(t.eDesc);
      return;
    }
    if (!(form.price > 0)) {
      setError(t.ePrice);
      return;
    }
    if (form.onSale && !(form.compareAt > form.price)) {
      setError(t.eCompareAt);
      return;
    }
    if (!form.image.trim()) {
      setError(t.eImage);
      return;
    }
    if (!Number.isInteger(form.stock) || form.stock < 0) {
      setError(t.eStock);
      return;
    }
    for (const c of colors) {
      // Name is optional (swatch-only colors allowed); a valid hex is always
      // resolved on submit, so there is nothing to reject here.
      if (typeof c.hex !== 'string') {
        setError(t.eName);
        return;
      }
    }
    for (const s of sizes) {
      if (s.label.trim().length < 1) {
        setError(t.eName);
        return;
      }
    }
    for (const g of gallery) {
      if (g.url.trim().length < 1) {
        setError(t.eImage);
        return;
      }
    }
    await onSubmit({
      categoryId: form.categoryId,
      compareAtPrice: form.onSale ? form.compareAt : null,
      isNew: form.isNew,
      name: form.name.trim(),
      nameFr: blankToUndefined(form.nameFr),
      flavor: form.flavor.trim(),
      flavorFr: blankToUndefined(form.flavorFr),
      description: form.description.trim(),
      descriptionFr: blankToUndefined(form.descriptionFr),
      price: form.price,
      image: form.image.trim(),
      stock: outOfStock ? 0 : form.stock,
      galleryEnabled: form.galleryEnabled,
      colors: colors.map((c) => ({
        key: c.key,
        name: blankToUndefined(c.name),
        nameFr: blankToUndefined(c.nameFr),
        hex: resolveHex(c.name, c.nameFr, c.hex),
        label: blankToUndefined(c.label),
      })),
      sizes: sizes.map((s) => ({
        key: s.key,
        label: s.label.trim(),
        enabled: s.enabled,
        stock: s.stock,
      })),
      images: gallery.map((g) => ({
        key: g.key,
        url: g.url.trim(),
        alt: blankToUndefined(g.alt),
        colorKey: g.colorKey || undefined,
      })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 font-sans-ui">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <Section title={t.secGeneral} defaultOpen>
        <div className="grid gap-4 sm:grid-cols-2 pt-4">
          <label className="block text-sm font-medium text-[#151515]">
            {t.fNameEn}
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={`${inputClass} mt-2`} placeholder="e.g. Relaxed Tailored Blazer" />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.fNameFr}
            <input value={form.nameFr} onChange={(e) => set('nameFr', e.target.value)} className={`${inputClass} mt-2`} placeholder="ex. Blazer fluide" />
          </label>
        </div>
        <div className="mt-4 text-xs text-[#6D6D6D]">
          {t.fSlug}: <span className="font-mono">/product/{slugify(form.name) || '…'}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <label className="block text-sm font-medium text-[#151515]">
            {t.fDescEn}
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className={`${inputClass} mt-2 resize-y`} placeholder="Write the product description here" />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.fDescFr}
            <textarea value={form.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} rows={4} className={`${inputClass} mt-2 resize-y`} placeholder="Écrivez la description ici" />
          </label>
        </div>
        <div className="mt-4 rounded-lg border border-[#E7E3DA] bg-[#FCFBF7] p-4">
          <label className="block text-sm font-medium text-[#151515]">
            {t.fCategory}
            <select
              value={form.categoryId || ''}
              onChange={(e) => set('categoryId', e.target.value || null)}
              className={`${inputClass} mt-2 bg-white`}
            >
              <option value="">{t.fNoCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'fr' ? c.nameFr || c.name : c.name}
                </option>
              ))}
            </select>
          </label>
          {suggestedCategory && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#6D6D6D] font-sans-ui">{t.fSuggested}:</span>
              <button
                type="button"
                onClick={() => set('categoryId', suggestedCategory.id)}
                className="px-3 py-1.5 rounded-full bg-[#1F5742]/10 text-[#1F5742] font-medium hover:bg-[#1F5742]/20 transition-colors"
              >
                {t.fApply} — {lang === 'fr' ? suggestedCategory.nameFr || suggestedCategory.name : suggestedCategory.name}
              </button>
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <label className="block text-sm font-medium text-[#151515]">
            {t.fTagEn}
            <input value={form.flavor} onChange={(e) => set('flavor', e.target.value)} className={`${inputClass} mt-2`} placeholder="e.g. Signature" />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.fTagFr}
            <input value={form.flavorFr} onChange={(e) => set('flavorFr', e.target.value)} className={`${inputClass} mt-2`} placeholder="ex. Signature" />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.fPrice}
            <input type="number" min={0} step={0.01} value={form.price || ''} onChange={(e) => set('price', e.target.value ? Number(e.target.value) : 0)} className={`${inputClass} mt-2`} placeholder="0" />
          </label>
        </div>
        <div className="rounded-lg border border-[#E7E3DA] bg-[#FCFBF7] p-4 mt-6 space-y-3">
          <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
            <input
              type="checkbox"
              checked={form.onSale}
              onChange={(e) => {
                const on = e.target.checked;
                set('onSale', on);
                if (on && !(form.compareAt > form.price)) set('compareAt', form.price);
              }}
              className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
            />
            {t.fSale}
          </label>
          {form.onSale && (
            <label className="block text-sm font-medium text-[#151515]">
              {t.fCompareAt}
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.compareAt || ''}
                onChange={(e) => set('compareAt', e.target.value ? Number(e.target.value) : 0)}
                className={`${inputClass} mt-2`}
                placeholder="0"
              />
            </label>
          )}
          <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => set('isNew', e.target.checked)}
              className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
            />
            {t.fNewArrival}
          </label>
        </div>
      </Section>

      <Section title={t.secMedia}>
        <div className="pt-4 space-y-4">
          <div>
            <div className="text-sm font-medium text-[#151515] mb-2">{t.fImage}</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={form.image.startsWith('data:') ? '' : form.image}
                onChange={(e) => set('image', e.target.value)}
                className={inputClass}
                placeholder={t.fImagePh}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium hover:bg-[#164030] transition-colors whitespace-nowrap"
              >
                {t.uploadImage}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </div>
            {form.image && (
              <img src={form.image} alt="" className="mt-3 h-24 w-24 rounded-lg object-cover border border-[#E7E3DA]" />
            )}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`mt-3 rounded-lg border border-dashed p-4 text-center text-sm text-[#6D6D6D] transition-colors ${
                dragActive ? 'border-[#1F5742] bg-[#1F5742]/5' : 'border-[#E7E3DA]'
              }`}
            >
              {t.fDragTitle}
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-[#E7E3DA] bg-[#FCFBF7] px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.galleryEnabled}
              onChange={(e) => set('galleryEnabled', e.target.checked)}
              className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
            />
            <span>
              <span className="block text-sm font-medium text-[#151515]">{t.galleryToggle}</span>
              <span className="block text-xs text-[#6D6D6D] mt-0.5">{t.galleryHint}</span>
            </span>
          </label>
          {form.galleryEnabled && (
            <GalleryManager
              images={gallery}
              colors={colors.map((c) => ({ key: c.key, name: c.name || t.colorName }))}
              lang={lang}
              onChange={setGallery}
              onError={setError}
            />
          )}
        </div>
      </Section>

      <Section title={t.secColors}>
        <div className="pt-4">
          <ColorManager colors={colors} lang={lang} onChange={setColors} />
        </div>
      </Section>

      <Section title={t.secSizes}>
        <div className="pt-4">
          <SizeManager sizes={sizes} lang={lang} onChange={setSizes} />
        </div>
      </Section>

      <Section title={t.secInventory}>
        <div className="pt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#151515]">
              {t.fStock}
              <input
                type="number"
                min={0}
                step={1}
                value={form.stock}
                onChange={(e) => set('stock', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                disabled={outOfStock}
                className={`${inputClass} mt-2 disabled:opacity-50`}
              />
            </label>
            <div className="text-sm">
              <div className="font-medium text-[#151515]">{t.invStatus}</div>
              <div className="mt-2">
                {outOfStock || form.stock <= 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">{t.invOutOfStock}</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#1F5742]/10 text-[#1F5742]">
                    {t.invInStock} • {form.stock}
                  </span>
                )}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
            <input
              type="checkbox"
              checked={outOfStock}
              onChange={(e) => setOutOfStock(e.target.checked)}
              className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
            />
            {t.fOos}
          </label>
          {sizes.length > 0 && (
            <div>
              <div className="text-sm font-medium text-[#151515] mb-2">{t.invPerSize}</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <span
                    key={s.key}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      s.enabled ? 'bg-[#F7F3EA] text-[#151515] border border-[#E7E3DA]' : 'bg-[#E7E3DA]/50 text-[#6D6D6D] line-through'
                    }`}
                  >
                    {s.label || '…'} • {s.stock == null ? t.invUnlimited : s.stock}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-lg border border-[#E7E3DA] text-sm font-medium text-[#151515] hover:bg-[#F7F3EA] transition-colors"
        >
          {t.fCancel}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium hover:bg-[#164030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? t.fSaving : product ? t.fUpdate : t.fAdd}
        </button>
      </div>
    </form>
  );
};
