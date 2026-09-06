// Client-side image preparation for admin uploads.
//
// Storage architecture: the database stores image URLs + metadata only — never
// raw uploads. There is currently no blob-storage provider wired to the project,
// so local files are compressed in-browser (max dimension + JPEG quality) into
// bounded data-URLs, exactly like the previous uploader did. If an upload stays
// too large after compression the caller must fall back to an image URL.
// (Future: Vercel Blob — requires a storage token, not configured.)

export function isSupportedImage(file: File): boolean {
  return file.type.startsWith('image/');
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
// Hard cap on the produced data-URL so PostgreSQL never receives huge binaries.
export const MAX_DATA_URL_LENGTH = 1_500_000;

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isSupportedImage(file)) {
      reject(new Error('not-image'));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        if (dataUrl.length > MAX_DATA_URL_LENGTH) {
          reject(new Error('too-large'));
          return;
        }
        resolve(dataUrl);
      } catch {
        reject(new Error('decode'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('decode'));
    };
    img.src = objectUrl;
  });
}

export function newTempKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
