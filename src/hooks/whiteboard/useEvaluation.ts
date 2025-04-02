
import { useState } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChallengeContext } from "@/context/ChallengeContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const useEvaluation = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { 
    activeChallenge,
    notes, 
    chatHistory,
    isEvaluating, setIsEvaluating,
    setShowResults, setEvaluationScore, setEvaluationFeedback,
    setEvaluationStrengths, setEvaluationImprovements, setEvaluationActionable,
    setEvaluationWeaknesses, setEvaluationNextSteps
  } = useChallengeContext();

  const handleSubmitForEvaluation = async (data: { finalAnswer?: string, chatHistory?: ChatMessage[] }, getCanvasData: () => string) => {
    if (!challengeId) return;
    
    setIsEvaluating(true);
    setShowResults(true);
    
    try {
      const canvasData = getCanvasData();
      
      const response = await supabase.functions.invoke('evaluate-challenge', {
        body: {
          submissionData: {
            challengeId,
            canvasData,
            notes,
            finalAnswer: data.finalAnswer,
            chatHistory: data.chatHistory || chatHistory,
            challengeDetails: activeChallenge // Pass the full challenge details for context
          }
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const { 
        score, 
        feedback, 
        strengths, 
        improvements, 
        actionable, 
        weaknesses, 
        nextSteps 
      } = response.data;
      
      setEvaluationScore(score);
      setEvaluationFeedback(feedback);
      setEvaluationStrengths(strengths || []);
      setEvaluationImprovements(improvements || []);
      setEvaluationActionable(actionable || []);
      
      // Set new evaluation fields
      if (weaknesses) {
        setEvaluationWeaknesses(weaknesses);
      }
      
      if (nextSteps) {
        setEvaluationNextSteps(nextSteps);
      }
      
      toast.success("Challenge evaluation completed!");
    } catch (error) {
      console.error("Evaluation error:", error);
      toast.error("Failed to evaluate challenge. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    navigate("/challenges");
  };

  return {
    isEvaluating,
    handleSubmitForEvaluation,
    handleCloseResults
  };
};
