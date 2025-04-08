import React, { useEffect, useState } from "react";
import WhiteboardHeader from "@/components/whiteboard/WhiteboardHeader";
import WhiteboardSidebar from "@/components/whiteboard/WhiteboardSidebar";
import WhiteboardArea from "@/components/whiteboard/WhiteboardArea";
import EvaluationResults from "@/components/whiteboard/EvaluationResults";
import { ChallengeProvider, useChallengeContext } from "@/context/ChallengeContext";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useVoiceControl } from "@/hooks/useVoiceControl";

const WhiteboardContent: React.FC = () => {
  const { 
    activeChallenge, notes, showResults, 
    evaluationScore, evaluationFeedback, isEvaluating, chatHistory 
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

  // Voice control for the entire whiteboard - fixed by removing sendMessage 
  // since it's now optional in the hook
  const { isVoiceMode, toggleVoiceMode } = useVoiceControl({
    chatHistory
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
            isVoiceMode={isVoiceMode}
            toggleVoiceMode={toggleVoiceMode}
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
          isVoiceMode={isVoiceMode}
          toggleVoiceMode={toggleVoiceMode}
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
