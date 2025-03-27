
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EvaluationResultsProps {
  isOpen: boolean;
  onClose: () => void;
  score: number | null;
  feedback: string | null;
  isLoading: boolean;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({
  isOpen,
  onClose,
  score,
  feedback,
  isLoading
}) => {
  // Function to format the feedback with proper spacing
  const formatFeedback = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Challenge Evaluation</DialogTitle>
          <DialogDescription>
            Your design challenge has been evaluated by an AI assistant.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[rgba(97,228,197,1)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-lg">Analyzing your design...</p>
            <p className="text-muted-foreground">This may take a minute or two.</p>
          </div>
        ) : (
          <div className="py-4">
            {score !== null && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-[rgba(233,231,252,0.3)] rounded-full border-4 border-[rgba(97,228,197,1)]">
                  <span className="text-4xl font-bold">{score}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Score out of 100</p>
              </div>
            )}

            {feedback && (
              <Accordion type="single" collapsible defaultValue="feedback" className="w-full">
                <AccordionItem value="feedback">
                  <AccordionTrigger className="text-lg font-semibold">Detailed Feedback</AccordionTrigger>
                  <AccordionContent className="text-base whitespace-pre-line">
                    {formatFeedback(feedback)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationResults;
