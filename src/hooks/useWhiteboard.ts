
import { useEffect } from "react";
import { useWhiteboardTools } from "./whiteboard/useWhiteboardTools";
import { useNotes } from "./whiteboard/useNotes";
import { useShapes } from "./whiteboard/useShapes";
import { useArrows } from "./whiteboard/useArrows";
import { useCanvas } from "./whiteboard/useCanvas";
import { useEvaluation } from "./whiteboard/useEvaluation";
import { useChallengeInitialization } from "./whiteboard/useChallengeInitialization";
import { useChallengeContext } from "@/context/ChallengeContext";

export const useWhiteboard = () => {
  const { activeChallenge } = useChallengeContext();
  const { activeTool, setActiveTool } = useWhiteboardTools();
  const { notes, updateNotePosition, updateNoteText, deleteNote } = useNotes();
  const { shapes, updateShapePosition, deleteShape } = useShapes();
  const { arrows, addArrow, updateArrow, deleteArrow } = useArrows();
  const { handleCanvasRef, getCanvasData } = useCanvas();
  const { isEvaluating, handleSubmitForEvaluation, handleCloseResults } = useEvaluation();
  const { handleBackToList, initializeChallenge } = useChallengeInitialization();

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        await initializeChallenge();
      } catch (error) {
        console.error("Error loading challenge:", error);
      }
    };
    
    loadChallenge();
  }, []);

  return {
    activeTool,
    setActiveTool,
    updateNotePosition,
    updateNoteText,
    deleteNote,
    handleBackToList,
    handleSubmitForEvaluation: (data: any) => handleSubmitForEvaluation(data, getCanvasData),
    handleCanvasRef,
    handleCloseResults,
    initializeChallenge,
    activeChallenge,
    isEvaluating,
    notes,
    shapes,
    updateShapePosition,
    deleteShape,
    arrows,
    updateArrow,
    addArrow,
    deleteArrow
  };
};
