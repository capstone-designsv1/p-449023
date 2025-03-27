
import React from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/interview/ChatInterface";
import InterviewHeader from "@/components/interview/InterviewHeader";
import InterviewIntroCard from "@/components/interview/InterviewIntroCard";
import FeedbackDisplay from "@/components/interview/FeedbackDisplay";
import { useInterviewChat } from "@/hooks/useInterviewChat";

interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry?: string;
}

const companies: Record<string, CompanyInfo> = {
  "uber": {
    id: "uber",
    name: "Uber",
    logo: "U",
    description: "Uber is a mobility service provider, enabling users to book drivers for trips.",
    industry: "transportation and delivery"
  },
  "airbnb": {
    id: "airbnb",
    name: "Airbnb",
    logo: "A",
    description: "Airbnb is an online marketplace for short and long-term homestays and experiences.",
    industry: "hospitality and accommodation"
  },
  "meta": {
    id: "meta",
    name: "Meta",
    logo: "M",
    description: "Meta builds technologies that help people connect, find communities, and grow businesses.",
    industry: "social media and technology"
  }
};

const InterviewChat: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const company = companyId && companies[companyId] ? companies[companyId] : companies.uber;
  
  const {
    designLevel,
    setDesignLevel,
    interviewStarted,
    feedback,
    activeTab,
    setActiveTab,
    handleStartInterview,
    handleSessionEnd,
    handleBackToList
  } = useInterviewChat(company);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      {/* Header */}
      <InterviewHeader 
        companyName={company.name} 
        handleBackToList={handleBackToList} 
      />

      {/* Main content */}
      <div className="flex-1 container max-w-6xl mx-auto py-6 px-4">
        {!interviewStarted ? (
          <InterviewIntroCard
            companyName={company.name}
            designLevel={designLevel}
            setDesignLevel={setDesignLevel}
            handleStartInterview={handleStartInterview}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "chat" | "feedback")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Interview Chat</TabsTrigger>
                <TabsTrigger value="feedback" disabled={!feedback}>
                  Feedback {!feedback && "(Available after interview)"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="border rounded-md">
                <div className="h-[calc(100vh-220px)]">
                  <ChatInterface 
                    companyName={company.name} 
                    designLevel={designLevel}
                    onSessionEnd={handleSessionEnd}
                    industry={company.industry}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="feedback">
                {feedback && (
                  <FeedbackDisplay 
                    feedback={feedback}
                    handleBackToList={handleBackToList}
                    setActiveTab={setActiveTab}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewChat;
