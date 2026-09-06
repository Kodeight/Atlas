import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { adminText, AdminLang } from './adminText';
import { newTempKey } from './imageUpload';
import { isValidHex, recognizeHex } from './colorNames';

const DEFAULT_HEX = '#1F5742';

export interface ColorRow {
  key: string;
  name: string;
  nameFr: string;
  hex: string;
  label: string;
}

interface ColorManagerProps {
  colors: ColorRow[];
  lang: AdminLang;
  onChange: (colors: ColorRow[]) => void;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const blankColor = (): ColorRow => ({ key: newTempKey('c'), name: '', nameFr: '', hex: '#1F5742', label: '' });

export const ColorManager: React.FC<ColorManagerProps> = ({ colors, lang, onChange }) => {
  const t = adminText[lang];
  const [dragKey, setDragKey] = useState<string | null>(null);

  const update = (key: string, patch: Partial<ColorRow>) => {
    onChange(
      colors.map((c) => {
        if (c.key !== key) return c;
        const next = { ...c, ...patch };
        // Auto-recognize the hex code from the typed name (EN/FR) unless the
        // admin already picked a custom color. The picker always wins.
        if ((patch.name !== undefined || patch.nameFr !== undefined) && !patch.hex) {
          const untouched = !isValidHex(c.hex) || c.hex.toLowerCase() === DEFAULT_HEX.toLowerCase();
          if (untouched) {
            const known =
              recognizeHex(patch.name !== undefined ? patch.name : next.name) ??
              recognizeHex(patch.nameFr !== undefined ? patch.nameFr : next.nameFr);
            if (known) next.hex = known;
          }
        }
        return next;
      }),
    );
  };

  const dropOn = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!dragKey || dragKey === targetKey) return;
    const from = colors.findIndex((c) => c.key === dragKey);
    const to = colors.findIndex((c) => c.key === targetKey);
    if (from >= 0 && to >= 0) onChange(move(colors, from, to));
    setDragKey(null);
  };

  return (
    <div className="space-y-3 font-sans-ui">
      <p className="text-xs text-[#6D6D6D]">{t.colorAutoHint}</p>
      {colors.map((c, idx) => (
        <div
          key={c.key}
          draggable
          onDragStart={() => setDragKey(c.key)}
          onDragOver={(e) => dropOn(e, c.key)}
          onDrop={(e) => dropOn(e, c.key)}
          onDragEnd={() => setDragKey(null)}
          className="flex items-center gap-2 sm:gap-3 rounded-lg border border-[#E7E3DA] bg-[#FCFBF7] p-3"
        >
          <span
            className="cursor-grab text-[#6D6D6D] shrink-0"
            title={t.dragHandle}
            aria-hidden="true"
          >
            <GripVertical className="w-4 h-4" />
          </span>
          <span
            className="w-9 h-9 rounded-full border border-black/15 shrink-0"
            style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : 'transparent' }}
            aria-hidden="true"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-w-0">
            <input
              value={c.name}
              onChange={(e) => update(c.key, { name: e.target.value })}
              placeholder={t.colorName}
              aria-label={t.colorName}
              className="px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
            />
            <input
              value={c.nameFr}
              onChange={(e) => update(c.key, { nameFr: e.target.value })}
              placeholder={t.colorNameFr}
              aria-label={t.colorNameFr}
              className="px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
            />
            <div className="flex gap-1.5 min-w-0">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#1F5742'}
                onChange={(e) => update(c.key, { hex: e.target.value })}
                aria-label={t.colorHex}
                className="w-9 h-9 p-0.5 border border-[#E7E3DA] rounded-lg bg-white cursor-pointer shrink-0"
              />
              <input
                value={c.hex}
                onChange={(e) => update(c.key, { hex: e.target.value })}
                placeholder="#1F5742"
                aria-label={t.colorHex}
                className="px-2 py-2 border border-[#E7E3DA] rounded-lg bg-white text-xs font-mono outline-none focus:border-[#1F5742] min-w-0 w-full"
              />
            </div>
            <input
              value={c.label}
              onChange={(e) => update(c.key, { label: e.target.value })}
              placeholder={t.colorLabel}
              aria-label={t.colorLabel}
              className="px-3 py-2 border border-[#E7E3DA] rounded-lg bg-white text-sm outline-none focus:border-[#1F5742] min-w-0"
            />
          </div>
          <div className="flex sm:flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onChange(move(colors, idx, idx - 1))}
              disabled={idx === 0}
              aria-label={t.moveUp}
              className="p-1.5 rounded-lg text-[#6D6D6D] hover:bg-[#E7E3DA]/60 disabled:opacity-30"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(move(colors, idx, idx + 1))}
              disabled={idx === colors.length - 1}
              aria-label={t.moveDown}
              className="p-1.5 rounded-lg text-[#6D6D6D] hover:bg-[#E7E3DA]/60 disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(colors.filter((x) => x.key !== c.key))}
              aria-label={t.removeRow}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {colors.length === 0 && <div className="text-sm text-[#6D6D6D]">{t.colorsEmpty}</div>}
      <button
        type="button"
        onClick={() => onChange([...colors, blankColor()])}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#1F5742]/50 text-sm font-medium text-[#1F5742] hover:bg-[#1F5742]/5 transition-colors"
      >
        <Plus className="w-4 h-4" /> {t.colorAdd}
      </button>
    </div>
  );
};
