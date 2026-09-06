import React, { useEffect, useState } from 'react';
import { adminText, AdminLang } from './adminText';

export interface StoreSettingsValue {
  storeName: string;
  logo: string;
  favicon: string;
  description: string;
  contactEmail: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  defaultCountry: string;
  defaultLanguage: string;
  deliveryEnabled: boolean;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: string;
  codEnabled: boolean;
  defaultOrderStatus: string;
}

export const emptySettings: StoreSettingsValue = {
  storeName: 'Atlas',
  logo: '',
  favicon: '',
  description: '',
  contactEmail: '',
  phone: '',
  address: '',
  currency: 'DZD',
  currencySymbol: 'DA',
  defaultCountry: 'Algeria',
  defaultLanguage: 'fr',
  deliveryEnabled: true,
  defaultDeliveryFee: 0,
  freeDeliveryThreshold: '',
  codEnabled: true,
  defaultOrderStatus: 'pending',
};

interface SettingsFormProps {
  value: Record<string, any> | null;
  lang: AdminLang;
  saving: boolean;
  onSave: (value: Record<string, any>) => Promise<void>;
}

const inputClass =
  'w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm text-[#151515] font-sans-ui outline-none transition-colors focus:border-[#1F5742] placeholder:text-[#6D6D6D]/60';

function toForm(value: Record<string, any> | null): StoreSettingsValue {
  const v = value || {};
  const str = (x: any, fb = '') => (typeof x === 'string' ? x : fb);
  return {
    storeName: str(v.storeName, 'Atlas'),
    logo: str(v.logo),
    favicon: str(v.favicon),
    description: str(v.description),
    contactEmail: str(v.contactEmail),
    phone: str(v.phone),
    address: str(v.address),
    currency: str(v.currency, 'DZD'),
    currencySymbol: str(v.currencySymbol, 'DA'),
    defaultCountry: str(v.defaultCountry, 'Algeria'),
    defaultLanguage: v.defaultLanguage === 'en' ? 'en' : 'fr',
    deliveryEnabled: v.deliveryEnabled !== false,
    defaultDeliveryFee: typeof v.defaultDeliveryFee === 'number' ? v.defaultDeliveryFee : 0,
    freeDeliveryThreshold: typeof v.freeDeliveryThreshold === 'number' ? String(v.freeDeliveryThreshold) : '',
    codEnabled: v.codEnabled !== false,
    defaultOrderStatus: ['pending', 'processing', 'delivered'].includes(v.defaultOrderStatus)
      ? v.defaultOrderStatus
      : 'pending',
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-[#E7E3DA] p-5">
      <h3 className="text-sm font-semibold text-[#151515] font-sans-ui mb-4">{title}</h3>
      {children}
    </div>
  );
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ value, lang, saving, onSave }) => {
  const t = adminText[lang];
  const [form, setForm] = useState<StoreSettingsValue>(() => toForm(value));

  useEffect(() => {
    setForm(toForm(value));
  }, [value]);

  const set = (field: keyof StoreSettingsValue, v: string | number | boolean) => {
    setForm((c) => ({ ...c, [field]: v }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      storeName: form.storeName.trim() || 'Atlas',
      logo: form.logo.trim() || null,
      favicon: form.favicon.trim() || null,
      description: form.description.trim() || null,
      contactEmail: form.contactEmail.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      currency: form.currency.trim() || 'DZD',
      currencySymbol: form.currencySymbol.trim() || 'DA',
      defaultCountry: form.defaultCountry.trim() || 'Algeria',
      defaultLanguage: form.defaultLanguage,
      deliveryEnabled: form.deliveryEnabled,
      defaultDeliveryFee: Math.max(0, Math.floor(Number(form.defaultDeliveryFee) || 0)),
      freeDeliveryThreshold:
        form.freeDeliveryThreshold === '' ? null : Math.max(0, Math.floor(Number(form.freeDeliveryThreshold) || 0)),
      codEnabled: form.codEnabled,
      defaultOrderStatus: form.defaultOrderStatus,
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-4 font-sans-ui">
      <Section title={t.setStore}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#151515]">
            {t.sStoreName}
            <input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sEmail}
            <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className={`${inputClass} mt-2`} placeholder="contact@atlas.dz" />
          </label>
          <label className="block text-sm font-medium text-[#151515] sm:col-span-2">
            {t.sDescription}
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} className={`${inputClass} mt-2 resize-y`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sPhone}
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sAddress}
            <input value={form.address} onChange={(e) => set('address', e.target.value)} className={`${inputClass} mt-2`} />
          </label>
        </div>
      </Section>

      <Section title={t.setAppearance}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#151515]">
            {t.sLogo}
            <input value={form.logo} onChange={(e) => set('logo', e.target.value)} className={`${inputClass} mt-2`} placeholder="https://…" />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sFavicon}
            <input value={form.favicon} onChange={(e) => set('favicon', e.target.value)} className={`${inputClass} mt-2`} placeholder="https://…" />
          </label>
        </div>
        {(form.logo || form.favicon) && (
          <div className="flex items-center gap-4 mt-3">
            {form.logo && <img src={form.logo} alt="Logo preview" className="h-10 w-auto object-contain border border-[#E7E3DA] rounded-lg px-2" />}
            {form.favicon && <img src={form.favicon} alt="Favicon preview" className="h-8 w-8 object-contain border border-[#E7E3DA] rounded-lg" />}
          </div>
        )}
      </Section>

      <Section title={t.setCommerce}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#151515]">
            {t.sCurrency}
            <input value={form.currency} onChange={(e) => set('currency', e.target.value)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sCurrencySymbol}
            <input value={form.currencySymbol} onChange={(e) => set('currencySymbol', e.target.value)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sCountry}
            <input value={form.defaultCountry} onChange={(e) => set('defaultCountry', e.target.value)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sLanguage}
            <select value={form.defaultLanguage} onChange={(e) => set('defaultLanguage', e.target.value)} className={`${inputClass} mt-2`}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </Section>

      <Section title={t.setDelivery}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
            <input type="checkbox" checked={form.deliveryEnabled} onChange={(e) => set('deliveryEnabled', e.target.checked)} className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer" />
            {t.sDeliveryOn}
          </label>
          <div />
          <label className="block text-sm font-medium text-[#151515]">
            {t.sDeliveryFee}
            <input type="number" min={0} step={1} value={form.defaultDeliveryFee} onChange={(e) => set('defaultDeliveryFee', Number(e.target.value) || 0)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sFreeThreshold}
            <input value={form.freeDeliveryThreshold} onChange={(e) => set('freeDeliveryThreshold', e.target.value)} inputMode="numeric" className={`${inputClass} mt-2`} placeholder="—" />
          </label>
        </div>
      </Section>

      <Section title={t.setOrders}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
            <input type="checkbox" checked={form.codEnabled} onChange={(e) => set('codEnabled', e.target.checked)} className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer" />
            {t.sCod}
          </label>
          <label className="block text-sm font-medium text-[#151515]">
            {t.sDefaultStatus}
            <select value={form.defaultOrderStatus} onChange={(e) => set('defaultOrderStatus', e.target.value)} className={`${inputClass} mt-2 capitalize`}>
              {(['pending', 'processing', 'delivered'] as const).map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <button
        type="submit"
        disabled={saving}
        className="justify-self-start px-6 py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium font-sans-ui hover:bg-[#164030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? t.sSaving : t.sSave}
      </button>
    </form>
  );
};
