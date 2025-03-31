
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
  const audioUrlRef = useRef<string | null>(null);
  const customVoiceId = 'F9Nt4wN7louPPlCeLCMN'; // Using the custom voice ID
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Initialize audio player
  if (typeof window !== 'undefined' && !audioPlayerRef.current) {
    audioPlayerRef.current = new Audio();
    
    // Add event listeners
    audioPlayerRef.current.addEventListener('ended', () => {
      console.log("Audio playback ended normally");
      cleanupAudioResources();
      setIsSpeaking(false);
      onSpeechEnd();
    });
    
    audioPlayerRef.current.addEventListener('error', (e) => {
      console.error("Audio playback error:", e);
      console.error("Audio error code:", audioPlayerRef.current?.error?.code);
      console.error("Audio error message:", audioPlayerRef.current?.error?.message);
      
      // Attempt retry for certain errors
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`Retry attempt ${retryCountRef.current}/${maxRetries}`);
        
        // Recreate the audio element
        if (audioUrlRef.current) {
          const currentUrl = audioUrlRef.current;
          setTimeout(() => {
            createAndPlayAudio(currentUrl);
          }, 500);
          return;
        }
      }
      
      toast.error("Failed to play audio. Please try again.");
      cleanupAudioResources();
      setIsSpeaking(false);
      onSpeechEnd();
    });

    // Add canplaythrough event listener
    audioPlayerRef.current.addEventListener('canplaythrough', () => {
      console.log("Audio can play through without buffering");
    });
  }

  // Cleanup function for audio resources
  const cleanupAudioResources = () => {
    if (audioUrlRef.current && audioUrlRef.current.startsWith('blob:')) {
      console.log("Revoking blob URL:", audioUrlRef.current);
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = '';
    }
    
    retryCountRef.current = 0;
  };

  // Helper function to create and play audio from URL
  const createAndPlayAudio = (url: string) => {
    if (!audioPlayerRef.current) return;
    
    try {
      console.log("Setting audio source to:", url);
      
      // Reset the audio player
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      
      // Set new source
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.load();
      
      console.log("Attempting to play audio...");
      const playPromise = audioPlayerRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Audio playback started successfully");
        }).catch(error => {
          console.error("Audio play promise error:", error);
          toast.error("Failed to play audio. Please try again.");
          cleanupAudioResources();
          setIsSpeaking(false);
          onSpeechEnd();
        });
      }
    } catch (error) {
      console.error("Error in createAndPlayAudio:", error);
      cleanupAudioResources();
      setIsSpeaking(false);
      onSpeechEnd();
    }
  };

  // Change voice
  const changeVoice = useCallback((voice: ElevenLabsVoice) => {
    setCurrentVoice(voice);
  }, []);

  const speakText = useCallback(async (text: string, voice?: ElevenLabsVoice) => {
    if (!text || isSpeaking) return;
    
    // Clean up any existing audio
    cleanupAudioResources();
    
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
        
        // Validate base64 content
        if (!audioContent || audioContent.trim() === '') {
          throw new Error('Empty audio content received');
        }
        
        // Create data URI and then blob
        const base64Uri = `data:audio/mp3;base64,${audioContent}`;
        console.log("Created data URI for audio");
        
        // Fetch the data URI to create a blob
        const fetchResponse = await fetch(base64Uri);
        if (!fetchResponse.ok) {
          throw new Error(`Failed to create blob from data URI: ${fetchResponse.statusText}`);
        }
        
        const blob = await fetchResponse.blob();
        console.log("Audio blob created:", blob.size, "bytes, type:", blob.type);
        
        if (blob.size === 0) {
          throw new Error('Created blob has zero size');
        }
        
        // Create object URL
        const url = URL.createObjectURL(blob);
        console.log("Created blob URL:", url);
        audioUrlRef.current = url;
        
        // Play the audio
        createAndPlayAudio(url);
      } catch (error) {
        console.error("Error processing audio data:", error);
        throw new Error('Failed to process audio data');
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      cleanupAudioResources();
      setIsSpeaking(false);
      onSpeechEnd();
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, customVoiceId]);

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
      console.log("Stopping audio playback");
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      
      cleanupAudioResources();
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
