
import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface InterviewFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface FeedbackDisplayProps {
  feedback: InterviewFeedback;
  handleBackToChat: () => void;
  handleBackToList: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  handleBackToChat,
  handleBackToList
}) => {
  return (
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
          onClick={handleBackToChat}
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
  );
};

export default FeedbackDisplay;
