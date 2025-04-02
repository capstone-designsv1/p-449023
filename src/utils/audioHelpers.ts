
/**
 * Audio utility functions for handling playback and resources cleanup
 */

/**
 * Process binary to base64 in chunks to prevent stack overflow
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process in smaller chunks to avoid stack overflow
  let base64 = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    const binaryChunk = Array.from(chunk).map(b => String.fromCharCode(b)).join('');
    base64 += btoa(binaryChunk);
  }
  
  return base64;
}

/**
 * Converts a base64 string to a Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Blob {
  // Decode base64
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  // Convert to byte array
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Creates a URL object from a blob
 */
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Safely revokes an object URL
 */
export function revokeAudioUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
