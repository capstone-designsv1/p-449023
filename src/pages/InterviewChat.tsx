
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InterviewHeader from "@/components/interview/InterviewHeader";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewTabs from "@/components/interview/InterviewTabs";
import { CompanyInfoType } from "@/components/interview/CompanyInfo";
import { FormattedFeedback } from "@/services/interviewChatService";

const companies: Record<string, CompanyInfoType> = {
  "uber": {
    id: "uber",
    name: "Uber",
    logo: "U",
    description: "Uber is a mobility service provider, enabling users to book drivers for trips."
  },
  "airbnb": {
    id: "airbnb",
    name: "Airbnb",
    logo: "A",
    description: "Airbnb is an online marketplace for short and long-term homestays and experiences."
  },
  "meta": {
    id: "meta",
    name: "Meta",
    logo: "M",
    description: "Meta builds technologies that help people connect, find communities, and grow businesses."
  }
};

const InterviewChat: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [designLevel, setDesignLevel] = useState<"Junior" | "Senior" | "Lead">("Junior");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [feedback, setFeedback] = useState<FormattedFeedback | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "feedback">("chat");

  const company = companyId && companies[companyId] ? companies[companyId] : companies.uber;

  const handleStartInterview = () => {
    setInterviewStarted(true);
  };

  const handleSessionEnd = (feedbackData: FormattedFeedback) => {
    setFeedback(feedbackData);
    setActiveTab("feedback");
  };

  const handleBackToList = () => {
    navigate("/challenges");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      {/* Header */}
      <InterviewHeader companyName={company.name} handleBackToList={handleBackToList} />

      {/* Main content */}
      <div className="flex-1 container max-w-6xl mx-auto py-6 px-4">
        {!interviewStarted ? (
          <InterviewSetup 
            company={company}
            designLevel={designLevel}
            setDesignLevel={setDesignLevel}
            handleStartInterview={handleStartInterview}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <InterviewTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              feedback={feedback}
              companyName={company.name}
              designLevel={designLevel}
              handleSessionEnd={handleSessionEnd}
              handleBackToList={handleBackToList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewChat;
