
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  playVoiceResponse, 
  ElevenLabsVoice, 
  getVoiceId,
  isElevenLabsConfigured
} from "@/services/elevenLabsService";

interface UseTextToSpeechProps {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export type { ElevenLabsVoice } from "@/services/elevenLabsService";

export const useTextToSpeech = ({
  onSpeechStart,
  onSpeechEnd
}: UseTextToSpeechProps) => {
  const [currentVoice, setCurrentVoice] = useState<ElevenLabsVoice>('custom');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Change voice
  const changeVoice = useCallback((voice: ElevenLabsVoice) => {
    setCurrentVoice(voice);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    // Since we're using the Audio API directly, we can't stop it easily
    // This is a limitation of the current implementation
    // For now, we'll just update the state
    setIsSpeaking(false);
    onSpeechEnd();
  }, [onSpeechEnd]);

  // Text to speech conversion and playback
  const speakText = useCallback(async (text: string) => {
    // Check if API is configured
    if (!isElevenLabsConfigured()) {
      toast.error('ElevenLabs API key is not configured. Voice features are disabled.');
      toast.error('Follow the README instructions to add your API key to .env.local', { duration: 5000 });
      return false;
    }
    
    if (!text || isSpeaking) {
      console.log(`Cannot speak text: ${!text ? 'Empty text' : 'Already speaking'}`);
      return false;
    }
    
    try {
      console.log(`Speaking text (length ${text.length}): "${text.substring(0, 50)}..."`);
      setIsSpeaking(true);
      onSpeechStart();
      
      // Get the voice ID based on the current voice
      const voiceId = getVoiceId(currentVoice);
      
      // Use our playVoiceResponse function
      const success = await playVoiceResponse(
        text, 
        voiceId,
        undefined, // We've already called onSpeechStart
        () => {
          setIsSpeaking(false);
          onSpeechEnd();
        }
      );
      
      if (!success) {
        throw new Error("Failed to play voice response");
      }
      
      return true;
      
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      setIsSpeaking(false);
      onSpeechEnd();
      return false;
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, currentVoice]);

  return {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  };
};
