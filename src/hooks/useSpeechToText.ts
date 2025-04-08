
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useMediaRecorder } from "./speech/useMediaRecorder";
import { useAudioProcessing } from "./speech/useAudioProcessing";
import { convertAudioToBase64 } from "@/utils/audioProcessingUtils";
import { transcribeAudio } from "@/services/speechToTextService";

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
  const timerRef = useRef<number | null>(null);

  // Define what happens when recording stops
  const handleRecordingComplete = async (audioChunks: Blob[]) => {
    try {
      // Process audio data
      const base64Audio = await convertAudioToBase64(audioChunks);
      
      // Send to speech-to-text service
      const transcribedText = await transcribeAudio(base64Audio);
      
      // Send transcript to callback
      onTranscriptReady(transcribedText);
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to transcribe your speech. Please try again.');
    } finally {
      setIsListening(false);
    }
  };

  // Set up media recorder
  const { 
    isRecording, 
    startRecording, 
    stopRecording 
  } = useMediaRecorder({
    onDataAvailable: handleRecordingComplete,
    onRecordingStop: () => {
      // Additional cleanup if needed
    }
  });

  // Set up audio processing and silence detection
  const { 
    setupSilenceDetection, 
    cleanupAudioResources 
  } = useAudioProcessing({
    isListening,
    onSilenceDetected: () => {
      if (isListening) {
        stopListening();
      }
    },
    silenceDetectionTime
  });

  // Clean up function for all timers
  const cleanupTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Main function to start listening
  const startListening = async () => {
    try {
      if (isListening) return;
      
      // Start recording
      const stream = await startRecording();
      setIsListening(true);
      
      // Set up silence detection
      if (stream) {
        setupSilenceDetection(stream);
      }
      
      // Set up max recording time
      timerRef.current = window.setTimeout(() => {
        console.log("Max recording time reached, stopping");
        if (isListening) {
          stopRecording();
          cleanupTimers();
          cleanupAudioResources();
          setIsListening(false);
          toast.info("Processing your speech...", { duration: 1500 });
        }
      }, maxRecordingTime);
      
      toast.info("Listening... Speak now", { duration: 3000 });
    } catch (error) {
      console.error('Error starting to listen:', error);
      toast.error('Could not access your microphone. Please check permissions and try again.');
    }
  };

  // Function to stop listening
  const stopListening = () => {
    if (isListening) {
      stopRecording();
      cleanupTimers();
      cleanupAudioResources();
      setIsListening(false);
      toast.info("Processing your speech...", { duration: 1500 });
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isListening) {
        stopRecording();
        cleanupTimers();
        cleanupAudioResources();
      }
    };
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening
  };
};
