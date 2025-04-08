
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface FloatingMicButtonProps {
  isListening: boolean;
  toggleListening: () => void;
  isVoiceMode: boolean;
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({
  isListening,
  toggleListening,
  isVoiceMode
}) => {
  if (!isVoiceMode) return null;
  
  return (
    <Button
      onClick={toggleListening}
      className={`absolute bottom-8 right-8 h-16 w-16 rounded-full shadow-lg flex items-center justify-center transition-colors ${
        isListening 
          ? "bg-red-500 hover:bg-red-600" 
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {isListening ? (
        <MicOff className="h-6 w-6 text-white" />
      ) : (
        <Mic className="h-6 w-6 text-white" />
      )}
    </Button>
  );
};

export default FloatingMicButton;
