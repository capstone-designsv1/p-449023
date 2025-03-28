
import React, { useEffect } from "react";
import WhiteboardHeader from "@/components/whiteboard/WhiteboardHeader";
import WhiteboardSidebar from "@/components/whiteboard/WhiteboardSidebar";
import WhiteboardArea from "@/components/whiteboard/WhiteboardArea";
import EvaluationResults from "@/components/whiteboard/EvaluationResults";
import { ChallengeProvider, useChallengeContext } from "@/context/ChallengeContext";
import { useWhiteboard } from "@/hooks/useWhiteboard";

const WhiteboardContent: React.FC = () => {
  const { 
    activeChallenge, notes, showResults, 
    evaluationScore, evaluationFeedback, isEvaluating 
  } = useChallengeContext();
  
  const {
    activeTool, setActiveTool,
    updateNotePosition, updateNoteText, deleteNote,
    handleBackToList, handleSubmitForEvaluation,
    handleCanvasRef, handleCloseResults, initializeChallenge,
    shapes, updateShapePosition, deleteShape,
    arrows, updateArrow, addArrow, deleteArrow
  } = useWhiteboard();

  useEffect(() => {
    initializeChallenge();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      {/* Header */}
      {activeChallenge && (
        <WhiteboardHeader 
          title={activeChallenge.title} 
          company={activeChallenge.company}
          onBackToList={handleBackToList}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <WhiteboardSidebar 
          description={activeChallenge?.description || ""}
          notes={notes}
          setNotes={useChallengeContext().setNotes}
          onSubmitForEvaluation={handleSubmitForEvaluation}
          isEvaluating={isEvaluating}
        />

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
