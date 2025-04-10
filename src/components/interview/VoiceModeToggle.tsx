
import React from "react";
import InterviewVoiceModeToggle from "./InterviewVoiceModeToggle";

interface VoiceModeToggleProps {
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
}

const VoiceModeToggle: React.FC<VoiceModeToggleProps> = ({
  isVoiceMode,
  toggleVoiceMode
}) => {
  return (
    <InterviewVoiceModeToggle
      isVoiceMode={isVoiceMode}
      toggleVoiceMode={toggleVoiceMode}
    />
  );
};

export default VoiceModeToggle;
