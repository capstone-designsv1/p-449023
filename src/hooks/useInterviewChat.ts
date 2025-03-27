
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry?: string;
}

interface InterviewFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export const useInterviewChat = (company: CompanyInfo) => {
  const navigate = useNavigate();
  const [designLevel, setDesignLevel] = useState<"Junior" | "Senior" | "Lead">("Junior");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "feedback">("chat");

  const handleStartInterview = () => {
    setInterviewStarted(true);
  };

  const handleSessionEnd = (feedbackText: string) => {
    try {
      // Parse the feedback string into structured feedback
      // This is a simplified version - in a real app, the API would return structured data
      const parsedFeedback: InterviewFeedback = {
        score: 85, // Example score
        feedback: feedbackText,
        strengths: ["Communication skills", "Design process knowledge"],
        improvements: ["Consider more edge cases", "Ask more clarifying questions"]
      };
      
      setFeedback(parsedFeedback);
      setActiveTab("feedback");
    } catch (error) {
      console.error("Error parsing feedback:", error);
      setFeedback({
        score: 0,
        feedback: feedbackText,
        strengths: [],
        improvements: []
      });
    }
  };

  const handleBackToList = () => {
    navigate("/challenges");
  };

  return {
    designLevel,
    setDesignLevel,
    interviewStarted,
    feedback,
    activeTab,
    setActiveTab,
    handleStartInterview,
    handleSessionEnd,
    handleBackToList
  };
};
