
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

  // Clean up audio resources
  const cleanupAudioResources = () => {
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
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
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
              onSilenceDetected();
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

  // Cleanup when component unmounts or isListening changes
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  return {
    setupSilenceDetection,
    cleanupAudioResources
  };
};
