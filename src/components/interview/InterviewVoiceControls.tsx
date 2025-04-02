
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Headphones } from "lucide-react";

interface InterviewVoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  toggleListening: () => void;
  toggleSpeaking: () => void;
  chatHistoryExists: boolean;
}

const InterviewVoiceControls: React.FC<InterviewVoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isSending,
  toggleListening,
  toggleSpeaking,
  chatHistoryExists
}) => {
  return (
    <div className="flex justify-center space-x-3 mb-2">
      <Button
        variant="outline"
        size="sm"
        className={`transition-colors ${isListening ? 'bg-red-100 text-red-700 border-red-300' : ''}`}
        onClick={toggleListening}
        disabled={isSending}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1" /> Stop Listening
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" /> Listen
          </>
        )}
      </Button>
      
      {chatHistoryExists && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSpeaking}
          className={`transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4 mr-1" /> Stop
            </>
          ) : (
            <>
              <Headphones className="h-4 w-4 mr-1" /> Hear Response
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default InterviewVoiceControls;
