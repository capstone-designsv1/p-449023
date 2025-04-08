
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
  onSubmit: (data: { chatHistory?: ChatMessage[] }) => void;
  isEvaluating: boolean;
}

const SubmitEvaluationButton: React.FC<SubmitEvaluationButtonProps> = ({
  chatHistory,
  onSubmit,
  isEvaluating
}) => {
  const handleSubmit = () => {
    if (chatHistory.length <= 1) {
      toast.error("Please have a conversation before submitting for evaluation");
      return;
    }
    
    onSubmit({ chatHistory });
  };

  return (
    <Button 
      onClick={handleSubmit}
      className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3"
      disabled={isEvaluating || chatHistory.length <= 1}
    >
      {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
    </Button>
  );
};

export default SubmitEvaluationButton;
