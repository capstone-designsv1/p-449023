
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useChallengeContext } from "@/context/ChallengeContext";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { formatFeedbackItem, parseJsonString } from "@/utils/feedbackFormatter";

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
  isLoading,
}) => {
  const navigate = useNavigate();
  const { 
    evaluationStrengths, 
    evaluationImprovements, 
    evaluationActionable,
    evaluationWeaknesses, 
    evaluationNextSteps 
  } = useChallengeContext();

  const handleClose = () => {
    onClose();
    navigate("/challenges");
  };

  // Create prioritized improvements list - combining the main weakness and top improvements
  const createPrioritizedImprovements = (): string[] => {
    const priorities: string[] = [];
    
    // Add the main weakness first if available
    if (evaluationWeaknesses?.mainWeakness) {
      priorities.push(formatFeedbackItem(evaluationWeaknesses.mainWeakness));
    }
    
    // Add other improvements to fill out our list (up to 3 total)
    if (evaluationImprovements && evaluationImprovements.length > 0) {
      const remainingSlots = 3 - priorities.length;
      if (remainingSlots > 0) {
        evaluationImprovements.slice(0, remainingSlots).forEach(improvement => {
          priorities.push(formatFeedbackItem(improvement));
        });
      }
    }
    
    return priorities;
  };
  
  // Get 1-2 key strengths
  const getTopStrengths = (): string[] => {
    if (!evaluationStrengths || evaluationStrengths.length === 0) return [];
    
    return evaluationStrengths.slice(0, 2).map(strength => formatFeedbackItem(strength));
  };
  
  // Get 1-2 next steps - prioritizing dedicated next steps, falling back to actionable tips
  const getSuggestedNextSteps = (): string[] => {
    let steps: string[] = [];
    
    if (evaluationNextSteps && evaluationNextSteps.length > 0) {
      steps = evaluationNextSteps.slice(0, 2).map(step => formatFeedbackItem(step));
    } else if (evaluationActionable && evaluationActionable.length > 0) {
      steps = evaluationActionable.slice(0, 2).map(action => formatFeedbackItem(action));
    }
    
    return steps;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Evaluation Results</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(97,228,197,1)]"></div>
            <p className="mt-4 text-lg">Evaluating your challenge...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-[rgba(233,231,252,0.3)] rounded-full border-4 border-[rgba(97,228,197,1)]">
                  <span className="text-4xl font-bold">{score}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Score out of 100</p>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Overall Assessment</h3>
              <p className="text-gray-700 whitespace-pre-line">{parseJsonString(feedback || "")}</p>
            </div>
            
            {/* Top Priorities to Improve */}
            <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-amber-800">Top Priorities to Improve</h3>
              </div>
              <ul className="space-y-2">
                {createPrioritizedImprovements().map((priority, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium text-amber-700 mt-0.5 min-w-[20px]">{index + 1}.</span>
                    <p className="text-amber-900">{priority}</p>
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
                {getTopStrengths().map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium text-green-700 mt-0.5 min-w-[20px]">{index + 1}.</span>
                    <p className="text-green-900">{strength}</p>
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
                {getSuggestedNextSteps().map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium text-blue-700 mt-0.5 min-w-[20px]">{index + 1}.</span>
                    <p className="text-blue-900">{step}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleClose}
                className="bg-[rgba(97,228,197,1)] text-black border border-black hover:bg-[rgba(77,208,177,1)]"
              >
                Back to Challenges
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationResults;
