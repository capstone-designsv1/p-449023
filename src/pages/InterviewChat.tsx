
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/interview/ChatInterface";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
}

interface InterviewFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const companies: Record<string, CompanyInfo> = {
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
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "feedback">("chat");

  const company = companyId && companies[companyId] ? companies[companyId] : companies.uber;

  const handleStartInterview = () => {
    setInterviewStarted(true);
  };

  const handleSessionEnd = (feedbackText: string) => {
    // Parse the feedback string into structured feedback
    // This is a simplified version - in a real app, the API would return structured data
    try {
      // This is a placeholder for parsing the feedback text
      // In reality, your API should return structured data
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">{`Design Interview: ${company.name}`}</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={handleBackToList}
          className="border border-gray-300"
        >
          Back to Challenges
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 container max-w-6xl mx-auto py-6 px-4">
        {!interviewStarted ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Interview Simulation</h2>
                  <p className="text-gray-600 mb-4">
                    Practice a design interview with an AI interviewer from {company.name}. 
                    Select your experience level to get started.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Select Your Experience Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant={designLevel === "Junior" ? "default" : "outline"}
                      onClick={() => setDesignLevel("Junior")}
                      className={`${designLevel === "Junior" ? "bg-[rgba(97,228,197,1)] text-black border border-black" : ""}`}
                    >
                      Junior
                    </Button>
                    <Button 
                      variant={designLevel === "Senior" ? "default" : "outline"}
                      onClick={() => setDesignLevel("Senior")}
                      className={`${designLevel === "Senior" ? "bg-[rgba(97,228,197,1)] text-black border border-black" : ""}`}
                    >
                      Senior
                    </Button>
                    <Button 
                      variant={designLevel === "Lead" ? "default" : "outline"}
                      onClick={() => setDesignLevel("Lead")}
                      className={`${designLevel === "Lead" ? "bg-[rgba(97,228,197,1)] text-black border border-black" : ""}`}
                    >
                      Lead
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">What to Expect</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>The AI will play the role of a {company.name} interviewer</li>
                    <li>You'll be asked design questions appropriate for a {designLevel} designer</li>
                    <li>Respond as you would in a real interview</li>
                    <li>At the end, you'll receive detailed feedback on your performance</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleStartInterview}
                  className="w-full bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
                >
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="feedback">
                {feedback && (
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-bold mb-2">Interview Feedback</h2>
                      <div className="inline-flex items-center justify-center w-32 h-32 bg-[rgba(233,231,252,0.3)] rounded-full border-4 border-[rgba(97,228,197,1)]">
                        <span className="text-4xl font-bold">{feedback.score}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Score out of 100</p>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="overview">
                        <AccordionTrigger className="text-lg font-semibold">Overview</AccordionTrigger>
                        <AccordionContent className="text-base whitespace-pre-line">
                          {feedback.feedback}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="strengths">
                        <AccordionTrigger className="text-lg font-semibold">Strengths</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            {feedback.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="improvements">
                        <AccordionTrigger className="text-lg font-semibold">Areas for Improvement</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            {feedback.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("chat")}
                      >
                        Back to Chat
                      </Button>
                      <Button 
                        onClick={handleBackToList}
                        className="bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
                      >
                        Finish & Return to Challenges
                      </Button>
                    </div>
                  </div>
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
