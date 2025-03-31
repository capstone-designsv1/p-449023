
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseTextToSpeechProps {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export type ElevenLabsVoice = 
  | 'alloy'   // Rachel (female) - default
  | 'echo'    // Charlie (male)
  | 'fable'   // Domi (female)
  | 'onyx'    // Adam (male)
  | 'nova'    // Sarah (female)
  | 'shimmer'  // Elli (female)
  | 'custom'; // Custom voice ID

export const useTextToSpeech = ({
  onSpeechStart,
  onSpeechEnd
}: UseTextToSpeechProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<ElevenLabsVoice>('custom');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const customVoiceId = 'F9Nt4wN7louPPlCeLCMN'; // Using the custom voice ID

  // Initialize audio player
  if (typeof window !== 'undefined' && !audioPlayerRef.current) {
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.addEventListener('ended', () => {
      setIsSpeaking(false);
      onSpeechEnd();
    });
  }

  // Change voice
  const changeVoice = useCallback((voice: ElevenLabsVoice) => {
    setCurrentVoice(voice);
  }, []);

  const speakText = useCallback(async (text: string, voice?: ElevenLabsVoice) => {
    if (!text || isSpeaking) return;
    
    const selectedVoice = 'custom'; // Always use custom voice
    
    try {
      onSpeechStart();
      setIsSpeaking(true);
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voice: customVoiceId // Always pass the custom voice ID
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Convert base64 to audio
      const blob = await (await fetch(
        `data:audio/mp3;base64,${response.data.audioContent}`
      )).blob();
      
      const url = URL.createObjectURL(blob);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        await audioPlayerRef.current.play();
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      setIsSpeaking(false);
      onSpeechEnd();
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, customVoiceId]);

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsSpeaking(false);
      onSpeechEnd();
    }
  }, [onSpeechEnd]);

  return {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  };
};
