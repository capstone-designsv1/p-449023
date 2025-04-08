
import { useRef, useState } from "react";

interface UseMediaRecorderProps {
  onDataAvailable: (data: Blob[]) => void;
  onRecordingStop: () => void;
}

export const useMediaRecorder = ({
  onDataAvailable,
  onRecordingStop
}: UseMediaRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      if (isRecording) {
        console.log("MediaRecorder: Already recording, aborting new recording request");
        return null;
      }

      console.log("MediaRecorder: Requesting microphone access");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      });
      
      if (!stream) {
        throw new Error("MediaRecorder: Failed to get audio stream");
      }
      
      const audioTracks = stream.getAudioTracks();
      console.log(`MediaRecorder: Got stream with ${audioTracks.length} audio tracks`);
      
      if (audioTracks.length === 0) {
        throw new Error("MediaRecorder: No audio tracks in stream");
      }
      
      // List all tracks and their settings
      audioTracks.forEach((track, index) => {
        console.log(`MediaRecorder: Track ${index} enabled:`, track.enabled, "readyState:", track.readyState);
        const settings = track.getSettings();
        console.log("MediaRecorder: Track settings:", JSON.stringify(settings, null, 2));
        
        // Check if the track is actually live
        if (track.readyState !== 'live') {
          console.warn(`MediaRecorder: Track ${index} is not live!`);
        }
      });
      
      streamRef.current = stream;
      
      console.log("MediaRecorder: Creating MediaRecorder instance");
      
      // Try to detect supported mime types
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/wav',
        'audio/mp4'
      ];
      
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          console.log(`MediaRecorder: Using supported mime type: ${type}`);
          break;
        }
      }
      
      if (!selectedMimeType) {
        console.warn("MediaRecorder: No ideal mime type supported, using default");
      }
      
      let mediaRecorder: MediaRecorder;
      try {
        const options: MediaRecorderOptions = {
          mimeType: selectedMimeType || undefined,
          audioBitsPerSecond: 128000 // Higher quality audio
        };
        
        console.log("MediaRecorder: Creating with options:", JSON.stringify(options));
        mediaRecorder = new MediaRecorder(stream, options);
        console.log("MediaRecorder: Instance created successfully");
      } catch (e) {
        console.error("MediaRecorder: Failed to create with mime type, using default:", e);
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Monitor recorder state changes
      mediaRecorder.onstart = () => {
        console.log("MediaRecorder: Recording started");
        setIsRecording(true);
      };

      mediaRecorder.ondataavailable = (event) => {
        console.log(`MediaRecorder: Data available event, size: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        } else {
          console.warn("MediaRecorder: Received empty data chunk");
        }
      };

      mediaRecorder.onstop = () => {
        console.log(`MediaRecorder: Stopped with ${audioChunksRef.current.length} chunks collected`);
        
        if (audioChunksRef.current.length === 0) {
          console.warn("MediaRecorder: No audio chunks collected during recording");
        } else {
          // Calculate total size of recorded data
          const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          console.log(`MediaRecorder: Total audio data size: ${totalSize} bytes`);
        }
        
        onDataAvailable(audioChunksRef.current);
        onRecordingStop();
        setIsRecording(false);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder: Error during recording:", event);
      };

      // Set a shorter timeslice to get more frequent data chunks (every 1 second)
      console.log("MediaRecorder: Starting with 1000ms timeslice");
      mediaRecorder.start(1000);
      
      return stream;
    } catch (error) {
      console.error('MediaRecorder: Error accessing microphone:', error);
      
      // More specific error handling
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.error('MediaRecorder: Microphone permission denied by user');
        } else if (error.name === 'NotFoundError') {
          console.error('MediaRecorder: No microphone found on this device');
        } else if (error.name === 'NotReadableError') {
          console.error('MediaRecorder: Microphone is already in use by another application');
        } else {
          console.error(`MediaRecorder: Error: ${error.name} - ${error.message}`);
        }
      } else if (error instanceof Error) {
        console.error(`MediaRecorder: Error: ${error.name} - ${error.message}`);
      }
      
      throw error;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log(`MediaRecorder: Stopping recording (current state: ${mediaRecorderRef.current.state})`);
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("MediaRecorder: Error stopping recorder:", e);
      }
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        console.log("MediaRecorder: Stopping all audio tracks");
        streamRef.current.getTracks().forEach(track => {
          console.log(`MediaRecorder: Stopping track: ${track.kind} (readyState: ${track.readyState})`);
          track.stop();
        });
        streamRef.current = null;
      }
    } else {
      if (mediaRecorderRef.current) {
        console.log(`MediaRecorder: Not stopping - current state: ${mediaRecorderRef.current.state}`);
      } else {
        console.log("MediaRecorder: Not stopping - no MediaRecorder instance");
      }
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
