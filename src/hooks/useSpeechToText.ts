
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseSpeechToTextProps {
  onTranscriptReady: (text: string) => void;
  maxRecordingTime?: number;
  silenceDetectionTime?: number;
}

export const useSpeechToText = ({ 
  onTranscriptReady,
  maxRecordingTime = 15000, // 15 seconds max
  silenceDetectionTime = 2000 // 2 seconds of silence
}: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastAudioLevelRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Clean up function for all timers and audio resources
  const cleanupResources = () => {
    // Clear timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Close audio connections
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Set up silence detection
  const setupSilenceDetection = (stream: MediaStream) => {
    try {
      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      // Array to receive frequency data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Function to check audio levels
      const checkAudioLevel = () => {
        if (!isListening || !analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average audio level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        // Detect silence (low audio level)
        if (average < 10) { // Threshold for silence
          if (!silenceTimerRef.current) {
            // Start silence timer
            silenceTimerRef.current = window.setTimeout(() => {
              console.log("Silence detected, stopping recording");
              stopListening();
            }, silenceDetectionTime);
          }
        } else {
          // Reset silence timer if sound detected
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
        
        lastAudioLevelRef.current = average;
        
        // Continue checking if still listening
        if (isListening) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      // Start checking audio levels
      requestAnimationFrame(checkAudioLevel);
      
    } catch (error) {
      console.error("Error setting up silence detection:", error);
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
      cleanupResources();
    };
  }, []);

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

      // Set up max recording time
      timerRef.current = window.setTimeout(() => {
        console.log("Max recording time reached, stopping");
        stopListening();
      }, maxRecordingTime);

      // Set up silence detection
      setupSilenceDetection(stream);

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
      cleanupResources();
      setIsListening(false);
      toast.info("Processing your speech...", { duration: 1500 });
    }
  };

  return {
    isListening,
    startListening,
    stopListening
  };
};
