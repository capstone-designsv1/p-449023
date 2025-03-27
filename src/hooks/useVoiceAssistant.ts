
import { useState, useRef, useCallback } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseVoiceAssistantProps {
  onTranscriptReady: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export const useVoiceAssistant = ({
  onTranscriptReady,
  onSpeechStart,
  onSpeechEnd
}: UseVoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio player
  if (typeof window !== 'undefined' && !audioPlayerRef.current) {
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.addEventListener('ended', () => {
      setIsSpeaking(false);
      onSpeechEnd();
    });
  }

  const startListening = useCallback(async () => {
    try {
      if (isListening) return;
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // Create audio blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onload = async function(event) {
            if (!event.target) return;
            
            // Get base64-encoded audio data
            const base64Audio = (event.target.result as string).split(',')[1];
            
            try {
              console.log("Sending audio to speech-to-text function...");
              // Send to speech-to-text edge function
              const response = await supabase.functions.invoke('speech-to-text', {
                body: { audio: base64Audio }
              });
              
              if (response.error) {
                throw new Error(response.error.message);
              }
              
              if (response.data && response.data.text) {
                console.log("Transcription received:", response.data.text);
                // Pass transcribed text to callback
                onTranscriptReady(response.data.text);
              } else {
                throw new Error('Failed to transcribe audio');
              }
            } catch (error) {
              console.error('Transcription error:', error);
              toast.error('Failed to transcribe your speech. Please try again.');
              setIsListening(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Error processing audio. Please try again.');
          setIsListening(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      toast.info("Listening... Speak now", { duration: 3000 });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access your microphone. Please check permissions and try again.');
    }
  }, [isListening, onTranscriptReady]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      toast.info("Stopped listening", { duration: 1500 });
    }
  }, [isListening]);

  const speakText = useCallback(async (text: string, voice = 'alloy') => {
    if (!text || isSpeaking) return;
    
    try {
      onSpeechStart();
      setIsSpeaking(true);
      console.log("Converting text to speech:", text.substring(0, 50) + "...");
      
      // Call text-to-speech edge function
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.audioContent) {
        throw new Error('No audio content received');
      }
      
      console.log("Speech generated successfully, playing audio...");
      
      // Convert base64 to audio and play
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
  }, [isSpeaking, onSpeechStart, onSpeechEnd]);

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsSpeaking(false);
      onSpeechEnd();
    }
  }, [onSpeechEnd]);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};
