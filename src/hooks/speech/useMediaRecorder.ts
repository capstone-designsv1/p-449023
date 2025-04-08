
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
      if (isRecording) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        onDataAvailable(audioChunksRef.current);
        onRecordingStop();
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
