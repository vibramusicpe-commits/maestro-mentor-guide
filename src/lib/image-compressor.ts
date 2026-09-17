/**
 * ================================================================
 * image-compressor.ts — Compresor y Conversor a Formato WebP
 * ================================================================
 * Convierte cualquier captura/imagen (PNG, JPG, JPEG, HEIC, etc.)
 * a formato .webp de alta compresión y nitidez optimizada para
 * lectura de vouchers de Yape/Plin/BCP, reduciendo el peso de
 * 3-5 MB a ~60-120 KB para proteger la base de datos PostgreSQL.
 * ================================================================
 */

export interface CompressionResult {
  base64: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number; // Porcentaje de ahorro (ej. 95%)
  format: "image/webp" | "image/jpeg";
}

/**
 * Comprime un archivo File o Blob a DataURL WebP en el navegador del cliente.
 */
export async function compressImageToWebP(
  fileOrBlob: File | Blob,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.8
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(fileOrBlob.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        // Calcular dimensiones proporcionales
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback a DataURL original si el canvas falla
          const fallbackData = readerEvent.target?.result as string;
          resolve({
            base64: fallbackData,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            compressionRatio: 0,
            format: "image/jpeg",
          });
          return;
        }

        // Fondo blanco para evitar fondos negros en PNGs transparentes
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Intentar exportar a WebP
        let format: "image/webp" | "image/jpeg" = "image/webp";
        let compressedBase64 = canvas.toDataURL("image/webp", quality);

        // Si el navegador no soporta exportar a WebP, fallback a JPEG
        if (!compressedBase64.startsWith("data:image/webp")) {
          format = "image/jpeg";
          compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        }

        // Calcular tamaño aproximado del base64 comprimido
        const stringLength = compressedBase64.length - "data:image/webp;base64,".length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383;
        const compressedSizeKb = Math.round(sizeInBytes / 1024);
        const ratio = originalSizeKb > 0
          ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
          : 0;

        resolve({
          base64: compressedBase64,
          originalSizeKb,
          compressedSizeKb,
          compressionRatio: ratio,
          format,
        });
      };

      img.onerror = () => {
        reject(new Error("No se pudo decodificar la imagen seleccionada."));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo desde el dispositivo."));
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
