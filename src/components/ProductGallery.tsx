import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const activeImage = images[activeIndex] || images[0];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = () => {
    setLightboxZoom(1);
    setIsLightboxOpen(true);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxZoom((prev) => (prev === 1 ? 1.8 : 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Image Container */}
      <div className="relative w-full aspect-[4/5] bg-[#F2EDE2] rounded-xs overflow-hidden group cursor-zoom-in">
        <img
          src={activeImage}
          alt={`${productName} view ${activeIndex + 1}`}
          onClick={openLightbox}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Lightbox Expand Icon */}
        <button
          type="button"
          onClick={openLightbox}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#151515] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Open fullscreen gallery"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Mobile / Carousel Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[#151515] shadow-md transition-opacity md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[#151515] shadow-md transition-opacity md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter Pill */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`aspect-[4/5] rounded-xs overflow-hidden border bg-[#F2EDE2] transition-all ${
                activeIndex === idx
                  ? 'border-[#1F5742] ring-2 ring-[#1F5742] opacity-100'
                  : 'border-[#E7E3DA] opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Controls Bar */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
            <button
              type="button"
              onClick={toggleZoom}
              className="p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label={lightboxZoom === 1 ? 'Zoom in' : 'Zoom out'}
            >
              {lightboxZoom === 1 ? <ZoomIn className="w-5 h-5" /> : <ZoomOut className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Prev / Next Buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors z-20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors z-20"
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Lightbox Main Image */}
          <div className="relative max-w-4xl max-h-[88vh] overflow-hidden flex items-center justify-center">
            <img
              src={activeImage}
              alt={productName}
              style={{ transform: `scale(${lightboxZoom})`, cursor: lightboxZoom === 1 ? 'zoom-in' : 'zoom-out' }}
              onClick={toggleZoom}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-300"
            />
          </div>

          <div className="absolute bottom-4 inset-x-0 text-center text-white/70 text-xs font-sans-ui">
            {productName} • {activeIndex + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  );
};
