
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMicButtonProps {
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
  isListening?: boolean;
  toggleListening?: () => void;
  isSpeaking?: boolean;
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({ 
  isVoiceMode, 
  toggleVoiceMode,
  isListening,
  toggleListening,
  isSpeaking
}) => {
  if (!toggleVoiceMode) return null;
  
  const handleClick = () => {
    // If not in voice mode, enable voice mode AND start listening immediately
    if (!isVoiceMode) {
      toggleVoiceMode();
      // We need to wait a small amount of time for voice mode to be enabled
      // before we can start listening
      setTimeout(() => {
        if (toggleListening) {
          toggleListening();
        }
      }, 300);
    } 
    // If already in voice mode, just toggle listening state
    else if (toggleListening) {
      toggleListening();
    }
  };
  
  // Determine the button color based on the state
  // White: Not in voice mode
  // Green: In voice mode and listening
  // Pulsing Blue: When speaking
  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant="outline"
      className={cn(
        "absolute bottom-6 right-6 z-10 rounded-full w-12 h-12 transition-colors shadow-md",
        isVoiceMode 
          ? isListening 
            ? "bg-green-100 text-green-700 border-green-300" 
            : isSpeaking
              ? "bg-blue-100 text-blue-700 border-blue-300 animate-pulse"
              : "bg-white text-gray-700 border-gray-200"
          : "bg-white text-gray-700 border-gray-200"
      )}
      title={isVoiceMode 
        ? isListening 
          ? "Stop listening" 
          : isSpeaking 
            ? "AI is speaking" 
            : "Start listening" 
        : "Enable voice mode"}
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};

export default FloatingMicButton;
