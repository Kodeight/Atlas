import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
import { adminText, AdminLang } from './adminText';
import { compressImageFile, isSupportedImage, newTempKey } from './imageUpload';

export interface GalleryRow {
  key: string;
  url: string;
  alt: string;
  colorKey: string;
}

export interface GalleryColorOption {
  key: string;
  name: string;
}

interface GalleryManagerProps {
  images: GalleryRow[];
  colors: GalleryColorOption[];
  lang: AdminLang;
  onChange: (images: GalleryRow[]) => void;
  onError: (message: string) => void;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const blankGalleryRow = (): GalleryRow => ({ key: newTempKey('g'), url: '', alt: '', colorKey: '' });

export const GalleryManager: React.FC<GalleryManagerProps> = ({ images, colors, lang, onChange, onError }) => {
  const t = adminText[lang];
  const [dragKey, setDragKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = (key: string, patch: Partial<GalleryRow>) => {
    onChange(images.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  };

  const dropOn = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!dragKey || dragKey === targetKey) return;
    const from = images.findIndex((g) => g.key === dragKey);
    const to = images.findIndex((g) => g.key === targetKey);
    if (from >= 0 && to >= 0) onChange(move(images, from, to));
    setDragKey(null);
  };

  const handleFiles = async (files: FileList | null | undefined) => {
    if (!files || files.length === 0) return;
    const rows: GalleryRow[] = [];
    for (const file of Array.from(files)) {
      if (!isSupportedImage(file)) {
        onError(t.eFile);
        continue;
      }
      try {
        const url = await compressImageFile(file);
        rows.push({ ...blankGalleryRow(), url });
      } catch {
        onError(t.eImageTooBig);
      }
    }
    if (rows.length > 0) onChange([...images, ...rows]);
  };

  return (
    <div className="space-y-3 font-sans-ui">
      {images.map((g, idx) => (
        <div
          key={g.key}
          draggable
          onDragStart={() => setDragKey(g.key)}
          onDragOver={(e) => dropOn(e, g.key)}
          onDrop={(e) => dropOn(e, g.key)}
          onDragEnd={() => setDragKey(null)}
          className="flex items-start gap-2 sm:gap-3 rounded-lg border border-[#E7E3DA] bg-[#FCFBF7] p-3"
        >
          <span className="cursor-grab text-[#6D6D6D] shrink-0 mt-2" title={t.dragHandle} aria-hidden="true">
            <GripVertical className="w-4 h-4" />
          </span>
          {g.url ? (
            <img
              src={g.url}
              alt={g.alt || `Gallery image ${idx + 1}`}
              className="h-16 w-16 rounded-lg object-cover border border-[#E7E3DA] shrink-0"
              loading="lazy"
            />
          ) : (
            <span className="h-16 w-16 rounded-lg border border-dashed border-[#E7E3DA] flex items-center justify-center shrink-0 text-[#6D6D6D]">
              <ImagePlus className="w-5 h-5" />
            </span>
          )}
          <div className="grid sm:grid-cols-3 gap-2 flex-1 min-w-0">
            <input
              value={g.url}
              onChange={(e) => update(g.key, { url: e.target.value })}
              placeholder={t.imgUrl}
              aria-label={`${t.imgUrl} ${idx + 1}`}
              className="sm:col-span-2 px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
            />
            <select
              value={g.colorKey}
              onChange={(e) => update(g.key, { colorKey: e.target.value })}
              aria-label={`${t.imgColor} ${idx + 1}`}
              className="px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
            >
              <option value="">{t.imgNoColor}</option>
              {colors.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name || t.imgNoColor}
                </option>
              ))}
            </select>
            <input
              value={g.alt}
              onChange={(e) => update(g.key, { alt: e.target.value })}
              placeholder={t.imgAlt}
              aria-label={`${t.imgAlt} ${idx + 1}`}
              className="sm:col-span-3 px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
            />
          </div>
          <div className="flex sm:flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onChange(move(images, idx, idx - 1))}
              disabled={idx === 0}
              aria-label={t.moveUp}
              className="p-1.5 rounded-lg text-[#6D6D6D] hover:bg-[#E7E3DA]/60 disabled:opacity-30"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(move(images, idx, idx + 1))}
              disabled={idx === images.length - 1}
              aria-label={t.moveDown}
              className="p-1.5 rounded-lg text-[#6D6D6D] hover:bg-[#E7E3DA]/60 disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(images.filter((x) => x.key !== g.key))}
              aria-label={t.removeRow}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {images.length === 0 && <div className="text-sm text-[#6D6D6D]">{t.imagesEmpty}</div>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([...images, blankGalleryRow()])}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#1F5742]/50 text-sm font-medium text-[#1F5742] hover:bg-[#1F5742]/5 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t.imgAdd}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1F5742] text-white text-sm font-medium hover:bg-[#164030] transition-colors"
        >
          <Upload className="w-4 h-4" /> {t.uploadImage}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};
