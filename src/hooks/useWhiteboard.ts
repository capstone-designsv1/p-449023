
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChallengeContext } from "@/context/ChallengeContext";
import { ChallengeDetails } from "@/context/ChallengeContext";

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
    setShowResults, setEvaluationScore, setEvaluationFeedback,
    clearChatHistory, chatHistory,
    setEvaluationStrengths, setEvaluationImprovements, setEvaluationActionable
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
            chatHistory: data.chatHistory || chatHistory,
            challengeDetails: activeChallenge // Pass the full challenge details for context
          }
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const { score, feedback, strengths, improvements, actionable } = response.data;
      setEvaluationScore(score);
      setEvaluationFeedback(feedback);
      setEvaluationStrengths(strengths || []);
      setEvaluationImprovements(improvements || []);
      setEvaluationActionable(actionable || []);
      
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
    navigate("/challenges");
  };

  const initializeChallenge = () => {
    if (challengeId) {
      // Try to get the challenge from sessionStorage first
      const storedChallenge = sessionStorage.getItem('currentChallenge');
      
      if (storedChallenge) {
        try {
          const parsedChallenge = JSON.parse(storedChallenge) as ChallengeDetails;
          // Only use if IDs match
          if (parsedChallenge.id === challengeId) {
            setActiveChallenge(parsedChallenge);
            clearChatHistory();
            toast.success(`Challenge loaded: ${parsedChallenge.title}`);
            return;
          }
        } catch (error) {
          console.error("Error parsing stored challenge:", error);
        }
      }
      
      // If we don't have a stored challenge (or wrong ID), load it via the API
      try {
        // Use the ID from the URL as a seed for generating a challenge
        const [level, industry] = challengeId.split('-');
        const designLevel = level === 'junior' ? 'Junior' : level === 'lead' ? 'Lead' : 'Senior';
        
        // Generate a new challenge via the API
        supabase.functions.invoke('generate-challenge', {
          body: {
            designLevel,
            industry: industry.charAt(0).toUpperCase() + industry.slice(1), // Capitalize first letter
          }
        }).then(response => {
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          // Use the generated challenge
          const generatedChallenge = response.data;
          setActiveChallenge(generatedChallenge);
          clearChatHistory();
          toast.success(`Challenge loaded: ${generatedChallenge.title}`);
        }).catch(error => {
          console.error("Error generating challenge:", error);
          toast.error("Failed to load challenge. Redirecting to challenges page.");
          navigate("/challenges");
        });
      } catch (error) {
        console.error("Error initializing challenge:", error);
        navigate("/challenges");
      }
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
