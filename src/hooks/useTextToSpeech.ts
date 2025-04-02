
import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { convertTextToSpeech, ElevenLabsVoice } from "@/services/textToSpeechService";
import { toast } from "sonner";

interface UseTextToSpeechProps {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export { ElevenLabsVoice } from "@/services/textToSpeechService";

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
    if (!text || isSpeaking) return;
    
    try {
      onSpeechStart();
      
      // Convert text to speech and get audio URL
      const { audioUrl, error } = await convertTextToSpeech(text, customVoiceId);
      
      if (error || !audioUrl) {
        throw new Error(error?.message || "Failed to convert text to speech");
      }
      
      // Play the audio
      await playAudio(audioUrl);
    } catch (error) {
      console.error('Error speaking text:', error);
      toast.error('Failed to convert text to speech. Please try again.');
      onSpeechEnd();
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, playAudio, customVoiceId]);

  return {
    isSpeaking,
    currentVoice,
    changeVoice,
    speakText,
    stopSpeaking
  };
};
