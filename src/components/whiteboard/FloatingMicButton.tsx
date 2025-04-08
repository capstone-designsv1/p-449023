
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMicButtonProps {
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
  isListening?: boolean;
  toggleListening?: () => void;
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({ 
  isVoiceMode, 
  toggleVoiceMode,
  isListening,
  toggleListening
}) => {
  if (!toggleVoiceMode) return null;
  
  const handleClick = () => {
    // If not in voice mode, first enable voice mode
    if (!isVoiceMode) {
      toggleVoiceMode();
    } 
    // If in voice mode and toggleListening is available, toggle listening
    else if (toggleListening) {
      toggleListening();
    }
  };
  
  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant="outline"
      className={cn(
        "absolute bottom-6 right-6 z-10 rounded-full w-12 h-12 transition-colors shadow-md",
        isVoiceMode 
          ? isListening 
            ? "bg-red-100 text-red-700 border-red-300" 
            : "bg-green-100 text-green-700 border-green-300"
          : "bg-white"
      )}
      title={isVoiceMode ? (isListening ? "Stop listening" : "Start listening") : "Enable voice mode"}
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};

export default FloatingMicButton;
