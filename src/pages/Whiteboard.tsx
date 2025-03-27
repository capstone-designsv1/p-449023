import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import WhiteboardHeader from "@/components/whiteboard/WhiteboardHeader";
import WhiteboardSidebar from "@/components/whiteboard/WhiteboardSidebar";
import WhiteboardArea from "@/components/whiteboard/WhiteboardArea";
import EvaluationResults from "@/components/whiteboard/EvaluationResults";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChallengeDetails {
  id: string;
  title: string;
  company: string;
  description: string;
  instructions: string[];
}

// Sample data - this would typically come from a database
const challengeDetails: Record<string, ChallengeDetails> = {
  "uber-1": {
    id: "uber-1",
    title: "Redesign the Ride Ordering Experience",
    company: "Uber",
    description: "Create a simplified ride ordering flow that improves the user experience for first-time users.",
    instructions: [
      "Start by identifying the pain points in the current flow",
      "Sketch the main screens of your new design",
      "Focus on simplifying the process for new users",
      "Consider accessibility in your design"
    ]
  },
  "airbnb-1": {
    id: "airbnb-1",
    title: "Design a New Feature for Hosts",
    company: "Airbnb",
    description: "Design a feature that helps hosts better manage their property bookings and guest communications.",
    instructions: [
      "Research the current host experience",
      "Identify key pain points for hosts",
      "Sketch your solution's main flows",
      "Consider how this integrates with the existing platform"
    ]
  },
  "meta-1": {
    id: "meta-1",
    title: "Improve Group Interaction in VR",
    company: "Meta",
    description: "Conceptualize improvements to how users interact in group settings within a VR environment.",
    instructions: [
      "Define the current limitations of group interactions in VR",
      "Sketch new interaction models",
      "Consider both verbal and non-verbal communication",
      "Think about how to make interactions feel natural"
    ]
  },
  "uber-2": {
    id: "uber-2",
    title: "Design for Accessibility",
    company: "Uber",
    description: "Improve accessibility of the app for users with visual impairments.",
    instructions: [
      "Identify key accessibility issues in the current app",
      "Sketch solutions that address these issues",
      "Consider how your solutions benefit all users",
      "Think about implementation feasibility"
    ]
  },
  "airbnb-2": {
    id: "airbnb-2",
    title: "Streamline the Booking Process",
    company: "Airbnb",
    description: "Simplify the booking flow to reduce drop-offs and increase conversion.",
    instructions: [
      "Map out the current booking flow",
      "Identify steps that cause user drop-off",
      "Sketch a streamlined flow",
      "Consider how to maintain necessary information gathering"
    ]
  },
  "meta-2": {
    id: "meta-2",
    title: "Cross-Platform Design System",
    company: "Meta",
    description: "Design a system that maintains consistent user experience across mobile, desktop, and VR.",
    instructions: [
      "Define the core elements of your design system",
      "Sketch how components adapt across platforms",
      "Consider the unique constraints of each platform",
      "Demonstrate how your system maintains brand consistency"
    ]
  }
};

const Whiteboard: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDetails | null>(null);
  const [notes, setNotes] = useState<StickyNoteType[]>([]);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser" | "select" | "text">("pen");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (challengeId && challengeDetails[challengeId]) {
      setActiveChallenge(challengeDetails[challengeId]);
      toast(`Challenge loaded: ${challengeDetails[challengeId].title}`);
    } else {
      navigate("/challenges");
    }
  }, [challengeId, navigate]);

  const updateNotePosition = (id: string, position: { x: number; y: number }) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, position } : note
    ));
  };

  const updateNoteText = (id: string, text: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, text } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
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
          setNotes={setNotes}
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

export default Whiteboard;
