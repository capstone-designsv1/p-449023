
import React from "react";
import { Button } from "@/components/ui/button";

interface EndInterviewButtonProps {
  handleEndSession: () => void;
  isSending: boolean;
  isInitializing: boolean;
  chatHistoryLength: number;
}

const EndInterviewButton: React.FC<EndInterviewButtonProps> = ({
  handleEndSession,
  isSending,
  isInitializing,
  chatHistoryLength
}) => {
  return (
    <Button
      onClick={handleEndSession}
      disabled={isSending || isInitializing || chatHistoryLength < 3}
      className="w-full bg-white text-black border border-black hover:bg-gray-100"
    >
      End Interview & Get Feedback
    </Button>
  );
};

export default EndInterviewButton;
