
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  playVoiceResponse, 
  ElevenLabsVoice, 
  getVoiceId,
  isElevenLabsConfigured
} from "@/services/elevenLabsService";
import { useAudioResources } from "./audio/useAudioResources";
import { useAudioEvents } from "./audio/useAudioEvents";
import { useAudioPlayback } from "./audio/useAudioPlayback";
import { convertTextToSpeech } from "@/services/textToSpeechService";

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
  
  // Use our audio resources hook
  const { 
    audioRef, 
    audioUrlRef, 
    cleanupAudioResources 
  } = useAudioResources();
  
  // Use our audio events hook
  const { 
    handleAudioEnded, 
    handleAudioError 
  } = useAudioEvents({
    cleanupAudioResources,
    setIsPlaying: setIsSpeaking,
    onPlaybackEnd: onSpeechEnd
  });
  
  // Use our audio playback hook
  const { 
    playAudio, 
    stopAudio 
  } = useAudioPlayback({
    audioRef,
    audioUrlRef,
    isPlaying: isSpeaking,
    setIsPlaying: setIsSpeaking,
    handleAudioEnded,
    handleAudioError,
    cleanupAudioResources,
    onPlaybackStart: onSpeechStart,
    onPlaybackEnd: onSpeechEnd
  });
  
  // Change voice
  const changeVoice = useCallback((voice: ElevenLabsVoice) => {
    setCurrentVoice(voice);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    console.log("useTextToSpeech: stopSpeaking called");
    stopAudio();
  }, [stopAudio]);

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
      
      // Get the voice ID based on the current voice
      const voiceId = getVoiceId(currentVoice);
      
      // Try the modern approach first (direct playback via elevenLabsService)
      const success = await playVoiceResponse(
        text, 
        voiceId,
        onSpeechStart,
        onSpeechEnd
      );
      
      if (success) {
        console.log("Successfully played voice response via elevenLabsService");
        return true;
      }
      
      // Fallback to the older approach with convertTextToSpeech
      console.log("Falling back to convertTextToSpeech method");
      const result = await convertTextToSpeech(text, voiceId);
      
      if (result.error || !result.audioUrl) {
        console.error("TextToSpeech: Failed to convert text to speech:", result.error);
        throw new Error(result.error?.message || "Failed to convert text to speech");
      }
      
      // Play the audio URL
      await playAudio(result.audioUrl);
      return true;
      
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      setIsSpeaking(false);
      onSpeechEnd();
      return false;
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, currentVoice, playAudio]);

  return {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  };
};
