import React, { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

export interface AdminProduct {
  id: string;
  name: string;
  flavor?: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  color?: string;
  bgGradient?: string;
}

export interface ProductFormValue {
  name: string;
  flavor: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

interface ProductFormProps {
  product?: AdminProduct | null;
  onSubmit: (value: ProductFormValue) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

const emptyForm: ProductFormValue = {
  name: '',
  flavor: '',
  description: '',
  price: 0,
  image: '',
  stock: 0,
};

const inputClass =
  'w-full px-4 py-3 border border-[#E7E3DA] rounded-lg bg-[#FCFBF7] text-sm text-[#151515] font-sans-ui outline-none transition-colors focus:border-[#1F5742] placeholder:text-[#6D6D6D]/60';

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState<ProductFormValue>(emptyForm);
  const [outOfStock, setOutOfStock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        flavor: product.flavor || '',
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
      });
      setOutOfStock(product.stock <= 0);
    } else {
      setForm(emptyForm);
      setOutOfStock(false);
    }
    setError(null);
  }, [product]);

  const set = (field: keyof ProductFormValue, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      set('image', (e.target?.result as string) || '');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 3) {
      setError('Product name must be at least 3 characters.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (!(form.price > 0)) {
      setError('Price must be greater than 0.');
      return;
    }
    if (!form.image.trim()) {
      setError('An image URL or upload is required.');
      return;
    }
    if (!Number.isInteger(form.stock) || form.stock < 0) {
      setError('Stock must be a whole number of 0 or more.');
      return;
    }
    await onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      stock: outOfStock ? 0 : form.stock,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5 font-sans-ui">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#151515]">
          Product name
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="e.g. Relaxed Tailored Blazer"
          />
        </label>
        <label className="block text-sm font-medium text-[#151515]">
          Flavor / tag
          <input
            value={form.flavor}
            onChange={(e) => set('flavor', e.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="e.g. Signature"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#151515]">
          Price (DA)
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.price || ''}
            onChange={(e) => set('price', e.target.value ? Number(e.target.value) : 0)}
            className={`${inputClass} mt-2`}
            placeholder="0"
          />
        </label>
        <label className="block text-sm font-medium text-[#151515]">
          Stock
          <input
            type="number"
            min={0}
            step={1}
            value={form.stock}
            onChange={(e) => set('stock', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            disabled={outOfStock}
            className={`${inputClass} mt-2 disabled:opacity-50`}
            placeholder="0"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#151515]">
          Image URL or upload
          <input
            value={form.image.startsWith('data:') ? '' : form.image}
            onChange={(e) => set('image', e.target.value)}
            className={`${inputClass} mt-2`}
            placeholder="Paste an image URL or upload below"
          />
        </label>
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
          className={`mt-3 rounded-lg border border-dashed p-5 text-center transition-colors ${
            dragActive ? 'border-[#1F5742] bg-[#1F5742]/5' : 'border-[#E7E3DA] bg-[#FCFBF7]'
          }`}
        >
          {form.image ? (
            <div className="flex items-center justify-center gap-4">
              <img src={form.image} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-[#E7E3DA]" />
              <div className="text-left">
                <div className="text-sm font-medium text-[#151515]">Image ready</div>
                <button
                  type="button"
                  onClick={() => set('image', '')}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-6 h-6 mx-auto text-[#1F5742]" />
              <div className="mt-2 text-sm font-medium text-[#151515]">Drag and drop an image here</div>
              <div className="text-xs text-[#6D6D6D] mt-1">or</div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 rounded-lg bg-[#1F5742] text-white text-sm font-medium hover:bg-[#164030] transition-colors"
              >
                Choose file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
              <div className="mt-2 text-xs text-[#6D6D6D]">PNG, JPG or WebP</div>
            </div>
          )}
        </div>
      </div>

      <label className="block text-sm font-medium text-[#151515]">
        Description
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          className={`${inputClass} mt-2 resize-y`}
          placeholder="Write the product description here"
        />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium text-[#151515] cursor-pointer">
        <input
          type="checkbox"
          checked={outOfStock}
          onChange={(e) => setOutOfStock(e.target.checked)}
          className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
        />
        Mark as out of stock
      </label>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-lg border border-[#E7E3DA] text-sm font-medium text-[#151515] hover:bg-[#F7F3EA] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 rounded-lg bg-[#1F5742] text-white text-sm font-medium hover:bg-[#164030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : product ? 'Update product' : 'Add product'}
        </button>
      </div>
    </form>
  );
};
