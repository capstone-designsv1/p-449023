
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
  const recordingStartTimeRef = useRef<number>(0);

  // Define what happens when recording stops
  const handleRecordingComplete = async (audioChunks: Blob[]) => {
    console.log(`Speech-to-Text: Recording completed (${audioChunks.length} chunks)`);
    try {
      // Process audio data
      console.log("Speech-to-Text: Converting audio to base64");
      const base64Audio = await convertAudioToBase64(audioChunks);
      console.log(`Speech-to-Text: Base64 conversion complete, length: ${base64Audio.length}`);
      
      // Send to speech-to-text service
      console.log("Speech-to-Text: Sending to transcription service");
      const transcribedText = await transcribeAudio(base64Audio);
      
      console.log(`Speech-to-Text: Transcription received: "${transcribedText}"`);
      
      // Send transcript to callback
      onTranscriptReady(transcribedText);
    } catch (error) {
      console.error('Speech-to-Text: Error processing recording:', error);
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
      console.log("Speech-to-Text: Recording stopped by MediaRecorder");
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
        console.log(`Speech-to-Text: Silence detected for ${silenceDetectionTime}ms, stopping`);
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
      if (isListening) {
        console.log("Speech-to-Text: Already listening, ignoring start request");
        return;
      }
      
      console.log("Speech-to-Text: Starting microphone recording");
      
      // Record the starting time
      recordingStartTimeRef.current = Date.now();
      
      // Start recording
      const stream = await startRecording();
      if (!stream) {
        console.error("Speech-to-Text: Failed to get stream from startRecording");
        throw new Error("Failed to start recording");
      }
      
      console.log("Speech-to-Text: MediaRecorder initialized successfully");
      setIsListening(true);
      
      // Set up silence detection
      console.log("Speech-to-Text: Setting up silence detection");
      setupSilenceDetection(stream);
      
      // Set up max recording time
      console.log(`Speech-to-Text: Setting max recording time to ${maxRecordingTime}ms`);
      timerRef.current = window.setTimeout(() => {
        console.log("Speech-to-Text: Max recording time reached, stopping");
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
      console.error('Speech-to-Text: Error starting to listen:', error);
      toast.error('Could not access your microphone. Please check permissions and try again.');
    }
  };

  // Function to stop listening
  const stopListening = () => {
    if (isListening) {
      const recordingDuration = Date.now() - recordingStartTimeRef.current;
      console.log(`Speech-to-Text: Stopping listening after ${recordingDuration}ms`);
      
      stopRecording();
      cleanupTimers();
      cleanupAudioResources();
      setIsListening(false);
      toast.info("Processing your speech...", { duration: 1500 });
    } else {
      console.log("Speech-to-Text: Not listening, ignoring stop request");
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("Speech-to-Text: Cleaning up on unmount");
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
