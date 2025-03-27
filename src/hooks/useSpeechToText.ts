
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseSpeechToTextProps {
  onTranscriptReady: (text: string) => void;
}

export const useSpeechToText = ({ onTranscriptReady }: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = async () => {
    try {
      if (isListening) return;
      
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
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onload = async function(event) {
            if (!event.target) return;
            
            const base64Audio = (event.target.result as string).split(',')[1];
            
            try {
              const response = await supabase.functions.invoke('speech-to-text', {
                body: { audio: base64Audio }
              });
              
              if (response.error) {
                throw new Error(response.error.message);
              }
              
              if (response.data && response.data.text) {
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
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      toast.info("Stopped listening", { duration: 1500 });
    }
  };

  return {
    isListening,
    startListening,
    stopListening
  };
};
