
import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { formatFeedbackItem, parseJsonString } from "@/utils/feedbackFormatter";

export interface FormattedFeedback {
  score: number;
  overview: string;
  topPriorities: string[];
  strengths: string[];
  nextSteps: string[];
}

interface FeedbackDisplayProps {
  feedback: FormattedFeedback;
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
      
      <div className="space-y-6">
        {/* Overview */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="overview" className="border-b-0">
            <AccordionTrigger className="text-lg font-semibold py-4">Overview</AccordionTrigger>
            <AccordionContent className="text-base">
              <p className="whitespace-pre-line">{parseJsonString(feedback.overview)}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Top Priorities to Improve */}
        <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-amber-800">Top Priorities to Improve</h3>
          </div>
          <ul className="space-y-2">
            {feedback.topPriorities.map((priority, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-medium text-amber-700 mt-0.5 min-w-[20px]">{index + 1}.</span>
                <p className="text-amber-900">{formatFeedbackItem(priority)}</p>
              </li>
            ))}
          </ul>
        </div>
        
        {/* What You Did Well */}
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-green-800">What You Did Well</h3>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-medium text-green-700 mt-0.5 min-w-[20px]">•</span>
                <p className="text-green-900">{formatFeedbackItem(strength)}</p>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Suggested Next Steps */}
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-blue-800">Suggested Next Steps</h3>
          </div>
          <ul className="space-y-2">
            {feedback.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-medium text-blue-700 mt-0.5 min-w-[20px]">{index + 1}.</span>
                <p className="text-blue-900">{formatFeedbackItem(step)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
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
