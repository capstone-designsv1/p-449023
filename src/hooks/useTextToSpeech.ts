
import { useState, useRef, useCallback, useEffect } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const customVoiceId = 'F9Nt4wN7louPPlCeLCMN'; // Using the custom voice ID
  
  // Make sure we only have one cleanup timer at a time
  const cleanupTimerRef = useRef<number | null>(null);
  
  // Create audio element only once during initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      
      // Add event listeners
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      
      // Cleanup on component unmount
      return () => {
        if (audio) {
          audio.pause();
          audio.src = '';
          audio.removeEventListener('ended', handleAudioEnded);
          audio.removeEventListener('error', handleAudioError);
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        }
        
        cleanupAudioResources();
      };
    }
  }, []);
  
  // Event handlers as separate functions for cleanup
  const handleAudioEnded = () => {
    console.log("Audio playback ended normally");
    cleanupAudioResources();
    setIsSpeaking(false);
    onSpeechEnd();
  };
  
  const handleAudioError = (e: Event) => {
    const error = audioRef.current?.error;
    console.error("Audio playback error:", e);
    console.error("Audio error code:", error?.code);
    console.error("Audio error message:", error?.message);
    
    toast.error("Failed to play audio. Please try again.");
    cleanupAudioResources();
    setIsSpeaking(false);
    onSpeechEnd();
  };
  
  const handleCanPlayThrough = () => {
    console.log("Audio can play through without buffering");
  };

  // Cleanup function for audio resources
  const cleanupAudioResources = useCallback(() => {
    if (audioRef.current) {
      // Reset audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    
    // Revoke any existing object URL to prevent memory leaks
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    
    // Clear any existing timers
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  }, []);

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
        throw new Error(response.error.message || "Error from text-to-speech function");
      }
      
      if (!response.data || !response.data.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Process the audio content
      const audioContent = response.data.audioContent;
      console.log("Audio content length:", audioContent.length);
      
      // Validate base64 content
      if (!audioContent || audioContent.trim() === '') {
        throw new Error('Empty audio content received');
      }
      
      // Ensure we have a valid audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', handleAudioEnded);
        audioRef.current.addEventListener('error', handleAudioError);
      }
      
      // Convert base64 to blob using a more reliable method
      try {
        // Decode base64
        const byteCharacters = atob(audioContent);
        const byteNumbers = new Array(byteCharacters.length);
        
        // Convert to byte array
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        
        // Create object URL and store it for cleanup later
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        
        console.log("Created blob URL:", url);
        
        // Set audio source and load before attempting to play
        const audio = audioRef.current;
        
        // Ensure src is set before attempting to play
        if (!url) {
          throw new Error("Failed to create audio URL");
        }
        
        audio.src = url;
        
        // Wait for audio to be loaded
        await new Promise<void>((resolve, reject) => {
          const loadHandler = () => {
            audio.removeEventListener('loadedmetadata', loadHandler);
            audio.removeEventListener('error', errorHandler);
            resolve();
          };
          
          const errorHandler = (e: Event) => {
            audio.removeEventListener('loadedmetadata', loadHandler);
            audio.removeEventListener('error', errorHandler);
            reject(new Error(`Audio load error: ${audio.error?.message || 'Unknown error'}`));
          };
          
          audio.addEventListener('loadedmetadata', loadHandler);
          audio.addEventListener('error', errorHandler);
          audio.load();
        });
        
        // Use a user interaction detection to handle autoplay restrictions
        const userInteracted = document.documentElement.hasAttribute('data-user-interacted');
        
        if (!userInteracted) {
          // If no interaction detected, show a message prompting user action
          toast.info("Click anywhere to enable audio playback");
          
          // Mark that we've shown this message
          document.documentElement.setAttribute('data-user-interacted', 'true');
          
          // Wait for user interaction before playing
          const playOnInteraction = () => {
            const playPromise = audio.play();
            if (playPromise) {
              playPromise.catch((error) => {
                console.error("Autoplay prevented:", error);
                toast.error("Please click to enable audio playback");
              });
            }
            document.removeEventListener('click', playOnInteraction);
          };
          
          document.addEventListener('click', playOnInteraction, { once: true });
        } else {
          // Attempt to play with proper error handling
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Play promise error:", error);
              
              // If autoplay failed due to browser restrictions, show a helpful message
              if (error.name === 'NotAllowedError') {
                toast.error("Browser blocked autoplay. Please click anywhere to enable audio.");
                
                // Set up a one-time click handler to play audio
                const clickHandler = () => {
                  audio.play().catch(e => console.error("Play after click failed:", e));
                  document.removeEventListener('click', clickHandler);
                };
                
                document.addEventListener('click', clickHandler, { once: true });
              } else {
                toast.error("Failed to play audio. Please try again.");
              }
              
              cleanupAudioResources();
              setIsSpeaking(false);
              onSpeechEnd();
            });
          }
        }
      } catch (error) {
        console.error("Error creating audio from base64:", error);
        throw new Error("Failed to process audio data");
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      cleanupAudioResources();
      setIsSpeaking(false);
      onSpeechEnd();
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, cleanupAudioResources, customVoiceId]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      console.log("Stopping audio playback");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      cleanupAudioResources();
      setIsSpeaking(false);
      onSpeechEnd();
      console.log("Audio playback stopped");
    }
  }, [onSpeechEnd, cleanupAudioResources]);

  return {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  };
};
