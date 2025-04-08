
import { useRef } from "react";
import { toast } from "sonner";

/**
 * Hook for handling speech-to-text errors
 */
export const useErrorHandling = () => {
  const lastErrorTimeRef = useRef<number>(0);

  // Handle recording errors
  const handleRecordingError = (error: any) => {
    console.error('Speech-to-Text: Error starting to listen:', error);
    
    // Prevent toast spam by limiting error messages
    const now = Date.now();
    if (now - lastErrorTimeRef.current < 5000) {
      return;
    }
    
    lastErrorTimeRef.current = now;
    
    // More specific error messages based on error type
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please check your browser permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        toast.error('Your microphone is busy or unavailable. Please close other apps using it.');
      } else {
        toast.error(`Microphone error: ${error.name}. Please check your device.`);
      }
    } else {
      toast.error('Could not access your microphone. Please check permissions and try again.');
    }
  };

  // Handle transcription errors
  const handleTranscriptionError = (error: any) => {
    console.error('Speech-to-Text: Error processing recording:', error);
    
    // Prevent toast spam
    const now = Date.now();
    if (now - lastErrorTimeRef.current > 5000) {
      lastErrorTimeRef.current = now;
      toast.error('Failed to transcribe your speech. Please try again.');
    }
  };

  return {
    handleRecordingError,
    handleTranscriptionError
  };
};
