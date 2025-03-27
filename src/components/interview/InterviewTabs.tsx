
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/interview/ChatInterface";
import { InterviewFeedback } from "./FeedbackDisplay";
import FeedbackDisplay from "./FeedbackDisplay";

interface InterviewTabsProps {
  activeTab: "chat" | "feedback";
  setActiveTab: (tab: "chat" | "feedback") => void;
  feedback: InterviewFeedback | null;
  companyName: string;
  designLevel: "Junior" | "Senior" | "Lead";
  handleSessionEnd: (feedbackText: string) => void;
  handleBackToList: () => void;
}

const InterviewTabs: React.FC<InterviewTabsProps> = ({
  activeTab,
  setActiveTab,
  feedback,
  companyName,
  designLevel,
  handleSessionEnd,
  handleBackToList
}) => {
  return (
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
            companyName={companyName} 
            designLevel={designLevel}
            onSessionEnd={handleSessionEnd}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="feedback">
        {feedback && (
          <FeedbackDisplay 
            feedback={feedback}
            handleBackToChat={() => setActiveTab("chat")}
            handleBackToList={handleBackToList}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default InterviewTabs;
