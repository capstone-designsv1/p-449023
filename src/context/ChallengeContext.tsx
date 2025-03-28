import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export interface ChallengeDetails {
  id: string;
  title: string;
  description: string;
  company: string;
  industry?: string;
}

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

interface ChallengeContextType {
  activeChallenge: ChallengeDetails | null;
  setActiveChallenge: React.Dispatch<React.SetStateAction<ChallengeDetails | null>>;
  notes: StickyNoteType[];
  setNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isEvaluating: boolean;
  setIsEvaluating: React.Dispatch<React.SetStateAction<boolean>>;
  showResults: boolean;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  evaluationScore: number | null;
  setEvaluationScore: React.Dispatch<React.SetStateAction<number | null>>;
  evaluationFeedback: string | null;
  setEvaluationFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  evaluationStrengths: string[];
  setEvaluationStrengths: React.Dispatch<React.SetStateAction<string[]>>;
  evaluationImprovements: string[];
  setEvaluationImprovements: React.Dispatch<React.SetStateAction<string[]>>;
  evaluationActionable: string[];
  setEvaluationActionable: React.Dispatch<React.SetStateAction<string[]>>;
  
  // New fields for enhanced evaluation
  evaluationWeaknesses: {
    mainWeakness: string;
    improvementSteps: string[];
  } | null;
  setEvaluationWeaknesses: React.Dispatch<React.SetStateAction<{
    mainWeakness: string;
    improvementSteps: string[];
  } | null>>;
  evaluationNextSteps: string[];
  setEvaluationNextSteps: React.Dispatch<React.SetStateAction<string[]>>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(
  undefined
);

export function useChallengeContext() {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error(
      "useChallengeContext must be used within a ChallengeProvider"
    );
  }
  return context;
}

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const [activeChallenge, setActiveChallenge] =
    useState<ChallengeDetails | null>(null);
  const [notes, setNotes] = useState<StickyNoteType[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] =
    useState<string | null>(null);
  const [evaluationStrengths, setEvaluationStrengths] = useState<string[]>([]);
  const [evaluationImprovements, setEvaluationImprovements] = useState<string[]>([]);
  const [evaluationActionable, setEvaluationActionable] = useState<string[]>([]);
  
  // New state for enhanced evaluation
  const [evaluationWeaknesses, setEvaluationWeaknesses] = useState<{
    mainWeakness: string;
    improvementSteps: string[];
  } | null>(null);
  const [evaluationNextSteps, setEvaluationNextSteps] = useState<string[]>([]);

  return (
    <ChallengeContext.Provider
      value={{
        activeChallenge,
        setActiveChallenge,
        notes,
        setNotes,
        chatHistory,
        setChatHistory,
        isEvaluating,
        setIsEvaluating,
        showResults,
        setShowResults,
        evaluationScore,
        setEvaluationScore,
        evaluationFeedback,
        setEvaluationFeedback,
        evaluationStrengths,
        setEvaluationStrengths,
        evaluationImprovements,
        setEvaluationImprovements,
        evaluationActionable,
        setEvaluationActionable,
        
        // Add new evaluation fields
        evaluationWeaknesses,
        setEvaluationWeaknesses,
        evaluationNextSteps,
        setEvaluationNextSteps
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}
