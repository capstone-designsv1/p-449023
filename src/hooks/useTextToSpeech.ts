
import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { convertTextToSpeech, ElevenLabsVoice } from "@/services/textToSpeechService";
import { toast } from "sonner";

interface UseTextToSpeechProps {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

// Use 'export type' for re-exporting types when isolatedModules is enabled
export type { ElevenLabsVoice } from "@/services/textToSpeechService";

export const useTextToSpeech = ({
  onSpeechStart,
  onSpeechEnd
}: UseTextToSpeechProps) => {
  const [currentVoice, setCurrentVoice] = useState<ElevenLabsVoice>('custom');
  const customVoiceId = 'F9Nt4wN7louPPlCeLCMN'; // Using the custom voice ID
  
  // Use the audio player hook for playback management
  const {
    isPlaying: isSpeaking,
    playAudio,
    stopAudio: stopSpeaking,
  } = useAudioPlayer({
    onPlaybackStart: onSpeechStart,
    onPlaybackEnd: onSpeechEnd
  });

  // Change voice
  const changeVoice = useCallback((voice: ElevenLabsVoice) => {
    setCurrentVoice(voice);
  }, []);

  // Text to speech conversion and playback
  const speakText = useCallback(async (text: string) => {
    if (!text || isSpeaking) {
      console.log(`Cannot speak text: ${!text ? 'Empty text' : 'Already speaking'}`);
      return;
    }
    
    try {
      console.log(`Speaking text (length ${text.length}): "${text.substring(0, 50)}..."`);
      onSpeechStart();
      
      // Convert text to speech and get audio URL
      console.log(`Using voice: ${currentVoice}, voice ID: ${customVoiceId}`);
      const { audioUrl, error } = await convertTextToSpeech(text, customVoiceId);
      
      if (error || !audioUrl) {
        const errorMessage = error?.message || "Failed to convert text to speech";
        console.error(`TTS error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      console.log(`TTS successful, playing audio URL: ${audioUrl}`);
      
      // Play the audio
      await playAudio(audioUrl);
      console.log("Audio playback initiated");
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      onSpeechEnd();
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, playAudio, currentVoice, customVoiceId]);

  return {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  };
};
