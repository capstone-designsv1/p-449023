
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useChallengeContext } from "@/context/ChallengeContext";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, ArrowRightCircle, Lightbulb } from "lucide-react";

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

            {/* Feedback */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Overall Assessment</h3>
              <p className="text-gray-700 whitespace-pre-line">{feedback}</p>
            </div>

            {/* Strengths */}
            {evaluationStrengths && evaluationStrengths.length > 0 && (
              <div className="space-y-2 border-l-4 border-green-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Key Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {evaluationStrengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">
                      <p>{strength}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Primary Weakness with Steps */}
            {evaluationWeaknesses && (
              <div className="space-y-2 border-l-4 border-amber-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold">Primary Area to Focus On</h3>
                </div>
                <p className="font-medium">{evaluationWeaknesses.mainWeakness}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600 mb-1">How to improve:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    {evaluationWeaknesses.improvementSteps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {evaluationImprovements && evaluationImprovements.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Other Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-3">
                  {evaluationImprovements.map((improvement, index) => (
                    <li key={index} className="text-gray-700">{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps Section */}
            {evaluationNextSteps && evaluationNextSteps.length > 0 && (
              <div className="space-y-2 border-l-4 border-blue-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Next Steps</h3>
                </div>
                <ul className="space-y-3">
                  {evaluationNextSteps.map((step, index) => (
                    <li key={index} className="text-gray-700 flex items-start gap-2">
                      <span className="font-medium text-blue-700 mt-0.5">#{index + 1}:</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Tips */}
            {evaluationActionable && evaluationActionable.length > 0 && (
              <div className="space-y-2 border-l-4 border-purple-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Actionable Tips</h3>
                </div>
                <ul className="space-y-2">
                  {evaluationActionable.map((action, index) => (
                    <li key={index} className="text-gray-700">{action}</li>
                  ))}
                </ul>
              </div>
            )}

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
