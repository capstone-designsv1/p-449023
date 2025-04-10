
import React, { useEffect, useState } from "react";
import WhiteboardHeader from "@/components/whiteboard/WhiteboardHeader";
import WhiteboardSidebar from "@/components/whiteboard/WhiteboardSidebar";
import WhiteboardArea from "@/components/whiteboard/WhiteboardArea";
import EvaluationResults from "@/components/whiteboard/EvaluationResults";
import { ChallengeProvider, useChallengeContext } from "@/context/ChallengeContext";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { useChallengeTimer } from "@/hooks/timer"; // Updated import path
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const WhiteboardContent: React.FC = () => {
  const { 
    activeChallenge, notes, showResults, 
    evaluationScore, evaluationFeedback, isEvaluating 
  } = useChallengeContext();
  
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    activeTool, setActiveTool,
    updateNotePosition, updateNoteText, deleteNote,
    handleBackToList, handleSubmitForEvaluation,
    handleCanvasRef, handleCloseResults, initializeChallenge,
    shapes, updateShapePosition, deleteShape,
    arrows, updateArrow, addArrow, deleteArrow
  } = useWhiteboard();

  // Extract challenge details for the timer
  const challengeId = activeChallenge?.id || "";
  const designLevel = activeChallenge?.company?.includes("Junior") 
    ? "Junior" 
    : activeChallenge?.company?.includes("Lead") 
      ? "Lead" 
      : "Senior";
  const industry = activeChallenge?.industry || "";

  // Initialize the timer
  const {
    timeRemaining,
    timeRemainingPercentage,
    isActive: isTimerActive,
    isLoading: isTimerLoading,
    error: timerError,
    totalMinutes,
    secondsRemaining
  } = useChallengeTimer({
    challengeId,
    designLevel,
    industry,
    title: activeChallenge?.title || "",
    description: activeChallenge?.description || "",
    onTimeExpired: () => {
      toast.warning("Time's up! Submitting your challenge response now.", {
        duration: 5000
      });
      handleSubmitForEvaluation({ finalAnswer: "Time expired - automatic submission" });
    }
  });

  useEffect(() => {
    if (activeChallenge) {
      setIsLoading(false);
    }
  }, [activeChallenge]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      {/* Header */}
      {isLoading ? (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ) : activeChallenge && (
        <WhiteboardHeader 
          title={activeChallenge.title} 
          company={activeChallenge.company}
          onBackToList={handleBackToList}
          timeRemaining={timeRemaining}
          timeRemainingPercentage={timeRemainingPercentage}
          isTimerActive={isTimerActive}
          isTimerLoading={isTimerLoading}
          secondsRemaining={secondsRemaining}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isLoading ? (
          <div className="w-96 border-r border-gray-200 bg-white p-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <WhiteboardSidebar 
            description={activeChallenge?.description || ""}
            notes={notes}
            setNotes={useChallengeContext().setNotes}
            onSubmitForEvaluation={handleSubmitForEvaluation}
            isEvaluating={isEvaluating}
          />
        )}

        {/* Whiteboard area */}
        <WhiteboardArea 
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          notes={notes}
          updateNotePosition={updateNotePosition}
          updateNoteText={updateNoteText}
          deleteNote={deleteNote}
          onCanvasRef={handleCanvasRef}
          shapes={shapes}
          updateShapePosition={updateShapePosition}
          deleteShape={deleteShape}
          arrows={arrows}
          updateArrow={updateArrow}
          addArrow={addArrow}
          deleteArrow={deleteArrow}
        />
      </div>

      {/* Evaluation Results Dialog */}
      <EvaluationResults
        isOpen={showResults}
        onClose={handleCloseResults}
        score={evaluationScore}
        feedback={evaluationFeedback}
        isLoading={isEvaluating}
      />
    </div>
  );
};

// Main Whiteboard component that provides the Challenge context
const Whiteboard: React.FC = () => {
  return (
    <ChallengeProvider>
      <WhiteboardContent />
    </ChallengeProvider>
  );
};

export default Whiteboard;
