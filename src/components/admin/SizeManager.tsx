import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { adminText, AdminLang } from './adminText';
import { newTempKey } from './imageUpload';

export interface SizeRow {
  key: string;
  label: string;
  enabled: boolean;
  stock: number | null;
}

interface SizeManagerProps {
  sizes: SizeRow[];
  lang: AdminLang;
  onChange: (sizes: SizeRow[]) => void;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const blankSize = (): SizeRow => ({ key: newTempKey('s'), label: '', enabled: true, stock: null });

export const SizeManager: React.FC<SizeManagerProps> = ({ sizes, lang, onChange }) => {
  const t = adminText[lang];
  const [dragKey, setDragKey] = useState<string | null>(null);

  const update = (key: string, patch: Partial<SizeRow>) => {
    onChange(sizes.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const dropOn = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!dragKey || dragKey === targetKey) return;
    const from = sizes.findIndex((s) => s.key === dragKey);
    const to = sizes.findIndex((s) => s.key === targetKey);
    if (from >= 0 && to >= 0) onChange(move(sizes, from, to));
    setDragKey(null);
  };

  return (
    <div className="space-y-3 font-sans-ui">
      {sizes.map((s, idx) => (
        <div
          key={s.key}
          draggable
          onDragStart={() => setDragKey(s.key)}
          onDragOver={(e) => dropOn(e, s.key)}
          onDrop={(e) => dropOn(e, s.key)}
          onDragEnd={() => setDragKey(null)}
          className="flex items-center gap-2 sm:gap-3 rounded-lg border border-[#E7E3DA] bg-[#FCFBF7] p-3"
        >
          <span className="cursor-grab text-[#6D6D6D] shrink-0" title={t.dragHandle} aria-hidden="true">
            <GripVertical className="w-4 h-4" />
          </span>
          <input
            value={s.label}
            onChange={(e) => update(s.key, { label: e.target.value })}
            placeholder={t.sizeLabel}
            aria-label={t.sizeLabel}
            className="w-24 px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm font-semibold outline-none focus:border-[#1F5742] shrink-0"
          />
          <input
            value={s.stock ?? ''}
            onChange={(e) =>
              update(s.key, {
                stock: e.target.value === '' ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)),
              })
            }
            type="number"
            min={0}
            step={1}
            placeholder={t.sizeStock}
            aria-label={t.sizeStock}
            className="flex-1 px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
          />
          <label className="flex items-center gap-2 text-sm text-[#151515] cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={s.enabled}
              onChange={(e) => update(s.key, { enabled: e.target.checked })}
              className="w-5 h-5 rounded accent-[#1F5742] cursor-pointer"
            />
            {t.sizeEnabled}
          </label>
          <div className="flex sm:flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onChange(move(sizes, idx, idx - 1))}
              disabled={idx === 0}
              aria-label={t.moveUp}
              className="p-1.5 rounded-lg text-[#6D6D6D] hover:bg-[#E7E3DA]/60 disabled:opacity-30"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(move(sizes, idx, idx + 1))}
              disabled={idx === sizes.length - 1}
              aria-label={t.moveDown}
              className="p-1.5 rounded-lg text-[#6D6D6D] hover:bg-[#E7E3DA]/60 disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(sizes.filter((x) => x.key !== s.key))}
              aria-label={t.removeRow}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {sizes.length === 0 && <div className="text-sm text-[#6D6D6D]">{t.sizesEmpty}</div>}
      <button
        type="button"
        onClick={() => onChange([...sizes, blankSize()])}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#1F5742]/50 text-sm font-medium text-[#1F5742] hover:bg-[#1F5742]/5 transition-colors"
      >
        <Plus className="w-4 h-4" /> {t.sizeAdd}
      </button>
    </div>
  );
};
