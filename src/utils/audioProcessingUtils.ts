
/**
 * Converts audio chunks to base64 format
 */
export const convertAudioToBase64 = async (audioChunks: Blob[]): Promise<string> => {
  try {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          return reject(new Error('Failed to convert audio to base64'));
        }
        
        // Extract the base64 data from the result string
        const base64Audio = event.target.result.split(',')[1];
        resolve(base64Audio);
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error('Error converting audio to base64:', error);
    throw error;
  }
};
