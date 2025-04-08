
import React, { useEffect, useState } from "react";
import { useChallengeContext } from "@/context/ChallengeContext";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { Skeleton } from "@/components/ui/skeleton";
import WhiteboardHeader from "@/components/whiteboard/WhiteboardHeader";
import PracticeScreen from "@/components/whiteboard/PracticeScreen";

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

  useEffect(() => {
    if (activeChallenge) {
      setIsLoading(false);
    }
  }, [activeChallenge]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex flex-1">
          <div className="w-96 border-r border-gray-200 bg-white p-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      {activeChallenge && (
        <>
          <WhiteboardHeader 
            title={activeChallenge.title} 
            company={activeChallenge.company}
            onBackToList={handleBackToList}
          />
          
          <PracticeScreen 
            challenge={activeChallenge}
            notes={notes}
            updateNotePosition={updateNotePosition}
            updateNoteText={updateNoteText}
            deleteNote={deleteNote}
            onSubmitForEvaluation={handleSubmitForEvaluation}
            isEvaluating={isEvaluating}
            showResults={showResults}
            evaluationScore={evaluationScore}
            evaluationFeedback={evaluationFeedback}
            onCloseResults={handleCloseResults}
            canvasRef={handleCanvasRef}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            shapes={shapes}
            updateShapePosition={updateShapePosition}
            deleteShape={deleteShape}
            arrows={arrows}
            updateArrow={updateArrow}
            addArrow={addArrow}
            deleteArrow={deleteArrow}
          />
        </>
      )}
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
