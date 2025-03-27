
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SubmitEvaluationButtonProps {
  chatHistory: ChatMessage[];
  onSubmit: (data: { chatHistory?: ChatMessage[], industry?: string }) => void;
  isEvaluating: boolean;
  industry?: string;
}

const SubmitEvaluationButton: React.FC<SubmitEvaluationButtonProps> = ({
  chatHistory,
  onSubmit,
  isEvaluating,
  industry
}) => {
  const handleSubmit = () => {
    if (chatHistory.length <= 1) {
      toast.error("Please have a conversation before submitting for evaluation");
      return;
    }
    
    onSubmit({ chatHistory, industry });
  };

  return (
    <Button 
      onClick={handleSubmit}
      className="w-full mt-3 bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
      disabled={isEvaluating || chatHistory.length <= 1}
    >
      {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
    </Button>
  );
};

export default SubmitEvaluationButton;
