import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import WhiteboardCanvas from "@/components/whiteboard/WhiteboardCanvas";
import StickyNote from "@/components/whiteboard/StickyNote";
import Toolbar from "@/components/whiteboard/Toolbar";
import EvaluationResults from "@/components/whiteboard/EvaluationResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface StickyNoteType {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
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

interface EvaluationFormValues {
  finalAnswer: string;
}

const Whiteboard: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDetails | null>(null);
  const [notes, setNotes] = useState<StickyNoteType[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [activeTool, setActiveTool] = useState<"pen" | "eraser" | "select" | "text">("pen");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);

  const form = useForm<EvaluationFormValues>({
    defaultValues: {
      finalAnswer: ""
    }
  });

  useEffect(() => {
    if (challengeId && challengeDetails[challengeId]) {
      setActiveChallenge(challengeDetails[challengeId]);
      toast(`Challenge loaded: ${challengeDetails[challengeId].title}`);
    } else {
      navigate("/challenges");
    }
  }, [challengeId, navigate]);

  const addStickyNote = () => {
    if (!newNoteText.trim()) return;
    
    const colors = ["#FEF7CD", "#FEC6A1", "#E5DEFF", "#FFDEE2", "#D3E4FD"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Place new notes in the sidebar
    const newNote = {
      id: `note-${Date.now()}`,
      text: newNoteText,
      position: { 
        x: 20, 
        y: 30 + notes.length * 20
      },
      color: randomColor
    };
    
    setNotes([...notes, newNote]);
    setNewNoteText("");
    toast.success("Sticky note added!");
  };

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

  const handleSubmitForEvaluation = async (data: EvaluationFormValues) => {
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
            finalAnswer: data.finalAnswer
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
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[rgba(25,26,35,1)]">
              {activeChallenge?.title || "Loading challenge..."}
            </h1>
            <p className="text-gray-600">{activeChallenge?.company}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleBackToList}
              className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200"
            >
              Back to Challenges
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col h-[calc(100vh-70px)] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Challenge Brief</h2>
            <p className="text-gray-700 mb-4">{activeChallenge?.description}</p>
          </div>
          
          {/* Sticky Notes Section */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Your Notes</h3>
            <Textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Type your note here..."
              className="min-h-[80px] mb-3"
            />
            <Button 
              onClick={addStickyNote}
              className="w-full bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)] mb-4"
            >
              Add Note
            </Button>
            
            {/* Display Notes */}
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="p-3 rounded shadow-sm relative"
                  style={{ backgroundColor: note.color }}
                >
                  <button
                    className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200/50 text-gray-600"
                    onClick={() => deleteNote(note.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                  <p className="pr-5">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Final Answer Section */}
          <div className="mt-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitForEvaluation)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="finalAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold">Final Answer</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your final solution or design rationale here..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
                  disabled={isEvaluating}
                >
                  {isEvaluating ? "Evaluating..." : "Submit for Evaluation"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Whiteboard area */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
          <WhiteboardCanvas activeTool={activeTool} onCanvasRef={handleCanvasRef} />
        </div>
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
