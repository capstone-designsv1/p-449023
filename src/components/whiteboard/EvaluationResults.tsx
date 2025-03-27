
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useChallengeContext } from "@/context/ChallengeContext";

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
  const { evaluationStrengths, evaluationImprovements, evaluationActionable } = useChallengeContext();

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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overall Feedback</h3>
              <p className="text-gray-700 whitespace-pre-line">{feedback}</p>
            </div>

            {/* Strengths */}
            {evaluationStrengths && evaluationStrengths.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Strengths</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluationStrengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {evaluationImprovements && evaluationImprovements.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluationImprovements.map((improvement, index) => (
                    <li key={index} className="text-gray-700">{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Feedback */}
            {evaluationActionable && evaluationActionable.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Actionable Steps</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluationActionable.map((action, index) => (
                    <li key={index} className="text-gray-700">{action}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4">
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
