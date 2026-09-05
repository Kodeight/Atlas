import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useShop();

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform translate-y-0">
      <div className="bg-[#1F5742] text-white px-4 py-3 rounded-xs shadow-xl border border-[#286d53] flex items-center gap-3 text-xs font-sans-ui max-w-md">
        <CheckCircle2 className="w-4 h-4 text-[#A3B899] shrink-0" />
        <span className="leading-snug">{toast.text}</span>
      </div>
    </div>
  );
};
