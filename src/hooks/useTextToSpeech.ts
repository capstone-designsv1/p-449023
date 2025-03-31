
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
    
    // Add error event listener
    audioPlayerRef.current.addEventListener('error', (e) => {
      console.error("Audio playback error:", e);
      toast.error("Failed to play audio. Please try again.");
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
      
      console.log("Sending TTS request with text:", text.substring(0, 50) + "...");
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voice: customVoiceId // Always pass the custom voice ID
        }
      });
      
      console.log("TTS response received:", response);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Convert base64 to audio
      try {
        const audioContent = response.data.audioContent;
        console.log("Audio content length:", audioContent.length);
        
        // Create audio blob with proper MIME type
        const blob = await fetch(`data:audio/mp3;base64,${audioContent}`).then(r => r.blob());
        console.log("Audio blob created:", blob.size, "bytes");
        
        const url = URL.createObjectURL(blob);
        
        if (audioPlayerRef.current) {
          // Reset the audio player before setting new source
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
          
          // Set new source and play
          audioPlayerRef.current.src = url;
          
          // Add event listeners for debugging
          const playPromise = audioPlayerRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Audio play error:", error);
              toast.error("Failed to play audio. Please try again.");
              setIsSpeaking(false);
              onSpeechEnd();
            });
          }
          
          console.log("Audio playback started");
        }
      } catch (error) {
        console.error("Error processing audio data:", error);
        throw new Error('Failed to process audio data');
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
      // Clean up the current audio URL to prevent memory leaks
      const currentSrc = audioPlayerRef.current.src;
      
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      
      if (currentSrc && currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
      
      setIsSpeaking(false);
      onSpeechEnd();
      console.log("Audio playback stopped");
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
