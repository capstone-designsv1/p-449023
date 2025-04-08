
import { useState, useRef, useEffect } from "react";

interface UseAudioProcessingProps {
  isListening: boolean;
  onSilenceDetected: () => void;
  silenceDetectionTime?: number; // Time in ms to trigger silence detection
}

export const useAudioProcessing = ({
  isListening,
  onSilenceDetected,
  silenceDetectionTime = 2000
}: UseAudioProcessingProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastAudioLevelRef = useRef<number>(0);
  const silenceStartTimeRef = useRef<number | null>(null);

  // Clean up audio resources
  const cleanupAudioResources = () => {
    console.log("AudioProcessing: Cleaning up audio resources");
    
    if (sourceRef.current) {
      console.log("AudioProcessing: Disconnecting source node");
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      console.log("AudioProcessing: Disconnecting analyser node");
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      console.log("AudioProcessing: Closing audio context");
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      console.log("AudioProcessing: Clearing silence timer");
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    silenceStartTimeRef.current = null;
  };

  // Set up silence detection
  const setupSilenceDetection = (stream: MediaStream) => {
    try {
      console.log("AudioProcessing: Setting up silence detection");
      
      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      console.log(`AudioProcessing: Created AudioContext with sample rate: ${audioContext.sampleRate}Hz`);
      
      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024; // Increased for better resolution
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;
      console.log(`AudioProcessing: Created AnalyserNode with fftSize: ${analyser.fftSize}`);
      
      // Create source from stream
      console.log("AudioProcessing: Creating audio source from stream");
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      // Array to receive frequency data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      console.log(`AudioProcessing: Created data array with size: ${dataArray.length}`);
      
      // Initialize silence start time
      silenceStartTimeRef.current = null;
      
      // Function to check audio levels
      const checkAudioLevel = () => {
        if (!isListening || !analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average audio level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        const now = Date.now();
        
        // Detect silence (low audio level)
        if (average < 10) { // Threshold for silence
          if (silenceStartTimeRef.current === null) {
            // Mark the start of silence
            silenceStartTimeRef.current = now;
            console.log("AudioProcessing: Silence started");
          } else {
            // Check if silence duration exceeds the threshold
            const silenceDuration = now - silenceStartTimeRef.current;
            if (silenceDuration >= silenceDetectionTime) {
              console.log(`AudioProcessing: Silence detected for ${silenceDuration}ms, triggering callback`);
              onSilenceDetected();
              return; // Stop monitoring after triggering
            }
          }
        } else {
          // Reset silence timer if sound detected
          if (silenceStartTimeRef.current !== null) {
            console.log("AudioProcessing: Sound detected, resetting silence timer");
            silenceStartTimeRef.current = null;
          }
        }
        
        lastAudioLevelRef.current = average;
        
        // Continue checking if still listening
        if (isListening) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      // Start checking audio levels
      console.log("AudioProcessing: Starting audio level monitoring");
      requestAnimationFrame(checkAudioLevel);
      
    } catch (error) {
      console.error("AudioProcessing: Error setting up silence detection:", error);
    }
  };

  // Cleanup when component unmounts or isListening changes
  useEffect(() => {
    return () => {
      console.log("AudioProcessing: Cleanup on unmount");
      cleanupAudioResources();
    };
  }, []);

  return {
    setupSilenceDetection,
    cleanupAudioResources
  };
};
