
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
  maxRecordingTime = 30000, // 30 seconds max
  silenceDetectionTime = 10000 // 10 seconds of silence
}: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const timerRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(0);

  // Define what happens when recording stops
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
      console.error('Speech-to-Text: Error processing recording:', error);
      
      // Prevent toast spam
      const now = Date.now();
      if (now - lastErrorTimeRef.current > 5000) {
        lastErrorTimeRef.current = now;
        toast.error('Failed to transcribe your speech. Please try again.');
      }
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
      console.log(`Speech-to-Text: Setting up silence detection (${silenceDetectionTime}ms)`);
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
      
      // More specific error messages
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Microphone access denied. Please check your browser permissions.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          toast.error('Your microphone is busy or unavailable. Please close other apps using it.');
        } else {
          toast.error(`Microphone error: ${error.name}. Please check your device.`);
        }
      } else {
        toast.error('Could not access your microphone. Please check permissions and try again.');
      }
      
      setIsListening(false);
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
      
      if (recordingDuration > 500) { // Only show toast if we recorded for at least half a second
        toast.info("Processing your speech...", { duration: 1500 });
      }
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
