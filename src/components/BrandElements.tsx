import React, { useState } from 'react';
import { ATLAS_OFFICIAL_LOGO } from '../services/imageService';

interface AtlasLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  height?: number | string;
}

export const AtlasLogo: React.FC<AtlasLogoProps> = ({
  className = 'h-8 sm:h-9 w-auto',
  height,
}) => {
  const [src, setSrc] = useState<string>(ATLAS_OFFICIAL_LOGO.local);

  const handleError = () => {
    if (src !== ATLAS_OFFICIAL_LOGO.remote) {
      setSrc(ATLAS_OFFICIAL_LOGO.remote);
    }
  };

  return (
    <img
      src={src}
      alt="ATLAS"
      onError={handleError}
      style={height ? { height } : undefined}
      className={`object-contain transition-opacity duration-200 ${className}`}
      loading="eager"
    />
  );
};

export const AtlasStarIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4 text-[#1F5742]',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
};

export const AtlasFloralMotif: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6 text-[#1F5742]',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="10" />
      <circle cx="50" cy="20" r="14" />
      <circle cx="50" cy="80" r="14" />
      <circle cx="20" cy="50" r="14" />
      <circle cx="80" cy="50" r="14" />
      <path d="M28 28L72 72M28 72L72 28" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
    </svg>
  );
};
