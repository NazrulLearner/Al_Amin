// src/modules/members/utils/imageCompression.ts

/**
 * 🖼️ Image Compression Utility
 * Converts image files to base64 with size reduction
 */

export const compressImageToBase64 = (
  file: File, 
  maxWidth: number = 200, 
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Profile photo - smaller size
export const compressProfilePhoto = (file: File): Promise<string> => {
  return compressImageToBase64(file, 200, 0.7);
};

// Signature - higher quality, wider
export const compressSignature = (file: File): Promise<string> => {
  return compressImageToBase64(file, 300, 0.8);
};