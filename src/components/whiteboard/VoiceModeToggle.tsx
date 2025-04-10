
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceModeToggleProps {
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
}

const VoiceModeToggle: React.FC<VoiceModeToggleProps> = ({
  isVoiceMode,
  toggleVoiceMode
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm"
      className={cn(
        "transition-colors hover:bg-[rgba(97,228,197,0.1)]",
        isVoiceMode 
          ? "bg-[rgba(97,228,197,0.2)] text-black border-[rgba(97,228,197,0.5)]" 
          : "border-gray-300"
      )}
      onClick={toggleVoiceMode}
      title={isVoiceMode ? "Disable voice mode" : "Enable voice mode"}
    >
      Voice Mode
      {isVoiceMode && (
        <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
      )}
    </Button>
  );
};

export default VoiceModeToggle;
