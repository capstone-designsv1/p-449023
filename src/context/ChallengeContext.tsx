
import React, { createContext, useState, useContext, ReactNode } from "react";

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

export interface ChallengeDetails {
  id: string;
  title: string;
  company: string;
  description: string;
  instructions: string[];
}

interface ChallengeContextType {
  activeChallenge: ChallengeDetails | null;
  setActiveChallenge: React.Dispatch<React.SetStateAction<ChallengeDetails | null>>;
  notes: StickyNoteType[];
  setNotes: React.Dispatch<React.SetStateAction<StickyNoteType[]>>;
  isEvaluating: boolean;
  setIsEvaluating: React.Dispatch<React.SetStateAction<boolean>>;
  showResults: boolean;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  evaluationScore: number | null;
  setEvaluationScore: React.Dispatch<React.SetStateAction<number | null>>;
  evaluationFeedback: string | null;
  setEvaluationFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearChatHistory: () => void;
  evaluationStrengths: string[];
  setEvaluationStrengths: React.Dispatch<React.SetStateAction<string[]>>;
  evaluationImprovements: string[];
  setEvaluationImprovements: React.Dispatch<React.SetStateAction<string[]>>;
  evaluationActionable: string[];
  setEvaluationActionable: React.Dispatch<React.SetStateAction<string[]>>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDetails | null>(null);
  const [notes, setNotes] = useState<StickyNoteType[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [evaluationStrengths, setEvaluationStrengths] = useState<string[]>([]);
  const [evaluationImprovements, setEvaluationImprovements] = useState<string[]>([]);
  const [evaluationActionable, setEvaluationActionable] = useState<string[]>([]);

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  return (
    <ChallengeContext.Provider
      value={{
        activeChallenge,
        setActiveChallenge,
        notes,
        setNotes,
        isEvaluating,
        setIsEvaluating,
        showResults,
        setShowResults,
        evaluationScore,
        setEvaluationScore,
        evaluationFeedback,
        setEvaluationFeedback,
        chatHistory,
        setChatHistory,
        clearChatHistory,
        evaluationStrengths,
        setEvaluationStrengths,
        evaluationImprovements,
        setEvaluationImprovements,
        evaluationActionable,
        setEvaluationActionable,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallengeContext = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error("useChallengeContext must be used within a ChallengeProvider");
  }
  return context;
};
