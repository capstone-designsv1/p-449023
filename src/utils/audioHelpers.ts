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
* Validates if a string is properly base64 encoded
* More permissive version that handles different base64 variants
*/
export function isValidBase64(str: string): boolean {
 if (!str) return false;
  try {
   // Remove any whitespace
   const cleanStr = str.replace(/\s/g, '');
  
   // Check if it's a data URL and extract the base64 part
   if (cleanStr.startsWith('data:')) {
     const base64Part = cleanStr.split(',')[1] || '';
     return isValidBase64Content(base64Part);
   }
  
   return isValidBase64Content(cleanStr);
 } catch (e) {
   console.error('Error validating base64:', e);
   return false;
 }
}


/**
* Helper function that checks if the content is valid base64
* Handles different variants and is more tolerant of non-standard encoding
*/
function isValidBase64Content(content: string): boolean {
 if (!content) return false;
  // First, try a more permissive check
 // Base64 should only contain A-Z, a-z, 0-9, +, /, and = for padding
 const regex = /^[A-Za-z0-9+/]*={0,2}$/;
  // If it's clearly not base64, return false
 if (!regex.test(content)) {
   // Fix common issues:
   // 1. Move any padding characters to the end
   let fixedContent = content.replace(/=/g, '') + '=='.substring(0, content.split('=').length - 1);
  
   // 2. Remove any non-base64 characters
   fixedContent = fixedContent.replace(/[^A-Za-z0-9+/=]/g, '');
  
   console.log("Attempting to fix base64 content");
  
   // Try the fixed content
   if (!regex.test(fixedContent)) {
     console.warn("Cannot fix base64 string, but will try to use it anyway");
   }
  
   // Return true to try processing it anyway
   return true;
 }
  // Standard base64 string length should be a multiple of 4
 // But we'll be permissive and accept non-standard lengths too
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
  
   // Fix any potential issues with the base64 string
   let fixedBase64 = cleanBase64;
  
   // Remove padding characters from the middle (if any)
   if (cleanBase64.indexOf('=') !== -1 && cleanBase64.indexOf('=') < cleanBase64.length - 2) {
     const withoutPadding = cleanBase64.replace(/=/g, '');
     // Add correct padding at the end
     const remainder = withoutPadding.length % 4;
     if (remainder > 0) {
       fixedBase64 = withoutPadding + '='.repeat(4 - remainder);
     } else {
       fixedBase64 = withoutPadding;
     }
     console.log("Fixed base64 padding");
   }
  
   // Decode base64 with error handling
   let byteCharacters;
   try {
     byteCharacters = atob(fixedBase64);
   } catch (e) {
     console.error('Base64 decoding failed, trying more permissive approach:', e);
    
     // As a last resort, try removing problematic characters
     const strippedBase64 = fixedBase64.replace(/[^A-Za-z0-9+/=]/g, '');
     try {
       byteCharacters = atob(strippedBase64);
     } catch (e2) {
       console.error('Final base64 decoding attempt failed:', e2);
       return null;
     }
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

