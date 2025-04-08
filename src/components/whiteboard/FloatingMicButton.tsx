
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMicButtonProps {
  isVoiceMode?: boolean;
  toggleVoiceMode?: () => void;
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({ 
  isVoiceMode, 
  toggleVoiceMode 
}) => {
  if (!toggleVoiceMode) return null;
  
  return (
    <Button
      onClick={toggleVoiceMode}
      size="icon"
      variant="outline"
      className={cn(
        "absolute bottom-6 right-6 z-10 rounded-full w-12 h-12 transition-colors shadow-md",
        isVoiceMode ? "bg-green-100 text-green-700 border-green-300" : "bg-white"
      )}
      title={isVoiceMode ? "Disable voice mode" : "Enable voice mode"}
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};

export default FloatingMicButton;
