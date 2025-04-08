
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useMediaRecorder } from "./speech/useMediaRecorder";
import { useAudioProcessing } from "./speech/useAudioProcessing";
import { useRecordingTimer } from "./speech/useRecordingTimer";
import { useSilenceDetection } from "./speech/useSilenceDetection";
import { useErrorHandling } from "./speech/useErrorHandling";
import { convertAudioToBase64 } from "@/utils/audioProcessingUtils";
import { transcribeAudio } from "@/services/speechToTextService";

interface UseSpeechToTextProps {
  onTranscriptReady: (text: string) => void;
  maxRecordingTime?: number;
  silenceDetectionTime?: number;
}

export const useSpeechToText = ({ 
  onTranscriptReady,
  maxRecordingTime = 30000, // 30 seconds max
  silenceDetectionTime = 10000 // 10 seconds of silence
}: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  
  // Handle errors with dedicated hook
  const { 
    handleRecordingError, 
    handleTranscriptionError 
  } = useErrorHandling();

  // Handle recording time limits
  const { 
    startTimer, 
    clearTimer, 
    getRecordingDuration 
  } = useRecordingTimer({
    maxRecordingTime,
    onMaxTimeReached: () => {
      if (isListening) {
        console.log("Speech-to-Text: Max recording time reached, stopping");
        stopListening();
      }
    }
  });

  // Process audio recording results
  const handleRecordingComplete = async (audioChunks: Blob[]) => {
    console.log(`Speech-to-Text: Recording completed (${audioChunks.length} chunks)`);
    
    if (audioChunks.length === 0) {
      console.error("Speech-to-Text: No audio chunks received");
      toast.error("No audio recorded. Please try again.");
      setIsListening(false);
      return;
    }
    
    try {
      // Process audio data
      console.log("Speech-to-Text: Converting audio to base64");
      const base64Audio = await convertAudioToBase64(audioChunks);
      console.log(`Speech-to-Text: Base64 conversion complete, length: ${base64Audio.length}`);
      
      if (!base64Audio || base64Audio.length < 100) {
        console.error("Speech-to-Text: Invalid base64 audio data");
        toast.error("Failed to process audio. Please try again.");
        setIsListening(false);
        return;
      }
      
      // Send to speech-to-text service
      console.log("Speech-to-Text: Sending to transcription service");
      const transcribedText = await transcribeAudio(base64Audio);
      
      if (transcribedText && transcribedText.trim()) {
        console.log(`Speech-to-Text: Transcription received: "${transcribedText}"`);
        // Send transcript to callback
        onTranscriptReady(transcribedText);
      } else {
        console.warn("Speech-to-Text: Empty transcription received");
        toast.warning("No speech detected. Please try speaking again.");
      }
    } catch (error) {
      handleTranscriptionError(error);
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
    }
  });

  // Set up silence detection
  const { 
    handleAudioLevelChange, 
    cleanupTimers: cleanupSilenceTimers 
  } = useSilenceDetection({
    isListening,
    onSilenceDetected: () => {
      if (isListening) {
        console.log(`Speech-to-Text: Silence detected for ${silenceDetectionTime}ms, stopping`);
        stopListening();
      }
    },
    silenceDetectionTime
  });

  // Set up audio processing and silence detection
  const { 
    setupSilenceDetection, 
    cleanupAudioResources 
  } = useAudioProcessing({
    isListening,
    onAudioLevelChange: handleAudioLevelChange,
    silenceDetectionTime
  });

  // Main function to start listening
  const startListening = useCallback(async () => {
    try {
      if (isListening) {
        console.log("Speech-to-Text: Already listening, ignoring start request");
        return;
      }
      
      console.log("Speech-to-Text: Starting microphone recording");
      
      // Start recording with timer
      const stream = await startRecording();
      if (!stream) {
        console.error("Speech-to-Text: Failed to get stream from startRecording");
        throw new Error("Failed to start recording");
      }
      
      console.log("Speech-to-Text: MediaRecorder initialized successfully");
      setIsListening(true);
      
      // Start recording timer
      startTimer();
      
      // Set up silence detection
      console.log(`Speech-to-Text: Setting up silence detection (${silenceDetectionTime}ms)`);
      setupSilenceDetection(stream);
      
      toast.info("Listening... Speak now", { duration: 3000 });
    } catch (error) {
      handleRecordingError(error);
      setIsListening(false);
    }
  }, [isListening, startRecording, setupSilenceDetection, startTimer, silenceDetectionTime]);

  // Function to stop listening
  const stopListening = useCallback(() => {
    if (isListening) {
      const recordingDuration = getRecordingDuration();
      console.log(`Speech-to-Text: Stopping listening after ${recordingDuration}ms`);
      
      stopRecording();
      clearTimer();
      cleanupSilenceTimers();
      cleanupAudioResources();
      
      if (recordingDuration > 500) { // Only show toast if we recorded for at least half a second
        toast.info("Processing your speech...", { duration: 1500 });
      }
    } else {
      console.log("Speech-to-Text: Not listening, ignoring stop request");
    }
  }, [isListening, stopRecording, clearTimer, cleanupSilenceTimers, cleanupAudioResources, getRecordingDuration]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("Speech-to-Text: Cleaning up on unmount");
      if (isListening) {
        stopRecording();
        clearTimer();
        cleanupSilenceTimers();
        cleanupAudioResources();
      }
    };
  }, [isListening, stopRecording, clearTimer, cleanupSilenceTimers, cleanupAudioResources]);

  return {
    isListening,
    startListening,
    stopListening
  };
};
