/**
 * Image compression and manipulation utilities
 */

/**
 * Compresses an image file by:
 * 1. Resizing it to a maximum dimension (preserving aspect ratio)
 * 2. Reducing quality through canvas compression
 * 
 * @param file The image file to compress
 * @param maxDimension Maximum width or height in pixels
 * @param quality JPEG quality (0-1)
 * @returns A new compressed Blob (with image/jpeg MIME type)
 */
export const compressImage = async (
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.7
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create image element to load the file
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions (preserve aspect ratio)
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }
        
        // Draw resized image on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not create blob from canvas'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};