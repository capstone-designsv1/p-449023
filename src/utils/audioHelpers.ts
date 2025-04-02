
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
 * Validates if a string is a valid base64 encoding
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  
  // Remove any whitespace
  const trimmed = str.trim();
  if (trimmed === '') return false;
  
  // Check basic length requirements (must be multiple of 4)
  if (trimmed.length % 4 !== 0) {
    console.warn("Base64 string length not multiple of 4:", trimmed.length);
  }
  
  // Check if it's valid base64 pattern
  // Base64 uses characters A-Z, a-z, 0-9, +, /, and = for padding
  if (!/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    console.error("Invalid characters in base64 string");
    return false;
  }
  
  // Check padding - if present, must be at the end and 1-2 characters
  const paddingMatch = trimmed.match(/=*$/);
  if (paddingMatch && paddingMatch[0].length > 0) {
    if (paddingMatch[0].length > 2) {
      console.error("Too many padding characters in base64 string");
      return false;
    }
    
    // Check if padding is only at the end
    if (trimmed.indexOf('=') !== trimmed.length - paddingMatch[0].length) {
      console.error("Padding characters must be at the end of base64 string");
      return false;
    }
  }
  
  return true;
}

/**
 * Safely converts a base64 string to a Blob with error handling
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Blob | null {
  try {
    // Check if the base64 string is valid
    if (!base64 || typeof base64 !== 'string') {
      console.error('Invalid base64 string provided');
      return null;
    }
    
    // Clean the base64 string (remove any potential whitespace or line breaks)
    const cleanBase64 = base64.trim();
    
    // Validate base64 content
    if (!isValidBase64(cleanBase64)) {
      console.error('Invalid base64 encoding detected');
      return null;
    }
    
    // Decode base64 with error handling
    let byteCharacters;
    try {
      byteCharacters = atob(cleanBase64);
    } catch (e) {
      console.error('Base64 decoding failed:', e);
      return null;
    }
    
    const byteNumbers = new Array(byteCharacters.length);
    
    // Convert to byte array
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('Failed to convert base64 to blob:', error);
    return null;
  }
}

/**
 * Creates a URL object from a blob
 */
export function createAudioUrl(blob: Blob | null): string | null {
  if (!blob) return null;
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
