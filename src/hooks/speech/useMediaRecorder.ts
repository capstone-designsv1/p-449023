
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
      
      console.log("MediaRecorder: Got stream with tracks:", stream.getAudioTracks().length);
      const trackSettings = stream.getAudioTracks()[0].getSettings();
      console.log("MediaRecorder: Audio track settings:", trackSettings);
      
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
        mediaRecorder = selectedMimeType 
          ? new MediaRecorder(stream, { mimeType: selectedMimeType })
          : new MediaRecorder(stream);
      } catch (e) {
        console.error("MediaRecorder: Failed to create with mime type, using default:", e);
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log(`MediaRecorder: Data available event, size: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log(`MediaRecorder: Stopped with ${audioChunksRef.current.length} chunks collected`);
        onDataAvailable(audioChunksRef.current);
        onRecordingStop();
        setIsRecording(false);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder: Error during recording:", event);
      };

      // Set a shorter timeslice to get more frequent data chunks (every 1 second)
      mediaRecorder.start(1000);
      console.log("MediaRecorder: Started recording");
      setIsRecording(true);
      
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
        }
      }
      
      throw error;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log("MediaRecorder: Stopping recording");
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("MediaRecorder: Error stopping recorder:", e);
      }
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        console.log("MediaRecorder: Stopping all audio tracks");
        streamRef.current.getTracks().forEach(track => {
          console.log(`MediaRecorder: Stopping track: ${track.kind}`);
          track.stop();
        });
        streamRef.current = null;
      }
    } else {
      console.log("MediaRecorder: Not recording or already inactive");
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
