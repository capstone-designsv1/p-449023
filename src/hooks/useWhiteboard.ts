
import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChallengeContext } from "@/context/ChallengeContext";
import { challengeDetails } from "@/data/challengeData";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const useWhiteboard = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { 
    activeChallenge, setActiveChallenge, 
    notes, isEvaluating, setIsEvaluating,
    setShowResults, setEvaluationScore, setEvaluationFeedback 
  } = useChallengeContext();
  
  const [activeTool, setActiveTool] = useState<"pen" | "eraser" | "select" | "text">("pen");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateNotePosition = (id: string, position: { x: number; y: number }) => {
    useChallengeContext().setNotes(notes.map(note => 
      note.id === id ? { ...note, position } : note
    ));
  };

  const updateNoteText = (id: string, text: string) => {
    useChallengeContext().setNotes(notes.map(note => 
      note.id === id ? { ...note, text } : note
    ));
  };

  const deleteNote = (id: string) => {
    useChallengeContext().setNotes(notes.filter(note => note.id !== id));
    toast.success("Sticky note removed");
  };

  const handleBackToList = () => {
    navigate("/challenges");
  };

  const getCanvasData = (): string => {
    if (!canvasRef.current) return "";
    return canvasRef.current.toDataURL();
  };

  const handleSubmitForEvaluation = async (data: { finalAnswer?: string, chatHistory?: ChatMessage[] }) => {
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
            chatHistory: data.chatHistory
          }
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const { score, feedback } = response.data;
      setEvaluationScore(score);
      setEvaluationFeedback(feedback);
      
      toast.success("Challenge evaluation completed!");
    } catch (error) {
      console.error("Evaluation error:", error);
      toast.error("Failed to evaluate challenge. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCanvasRef = (ref: HTMLCanvasElement | null) => {
    canvasRef.current = ref;
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const initializeChallenge = () => {
    if (challengeId && challengeDetails[challengeId]) {
      setActiveChallenge(challengeDetails[challengeId]);
      toast(`Challenge loaded: ${challengeDetails[challengeId].title}`);
    } else {
      navigate("/challenges");
    }
  };

  return {
    activeTool,
    setActiveTool,
    updateNotePosition,
    updateNoteText,
    deleteNote,
    handleBackToList,
    handleSubmitForEvaluation,
    handleCanvasRef,
    handleCloseResults,
    initializeChallenge,
    activeChallenge,
    isEvaluating
  };
};
