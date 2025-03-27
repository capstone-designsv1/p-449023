
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChallengeContext } from "@/context/ChallengeContext";
import { useNavigate } from "react-router-dom";

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
  const { evaluationStrengths, evaluationImprovements, evaluationActionable } = useChallengeContext();
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate("/challenges");
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Evaluating Your Work...</DialogTitle>
            <DialogDescription>
              Please wait while we analyze your design solution.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(97,228,197,1)]"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Award className="mr-2 h-5 w-5 text-[rgba(97,228,197,1)]" />
            Design Challenge Evaluation
          </DialogTitle>
          <DialogDescription>
            Here's feedback on your whiteboard design challenge performance.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex justify-center mb-6">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-1 -right-1 bg-[rgba(97,228,197,1)] text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border border-white">
                {score ? Math.round(score) : 0}
              </div>
              <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-[rgba(97,228,197,0.5)] flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">
                  {score ? Math.round(score) : 0}
                </span>
              </div>
              <span className="text-sm text-gray-500 mt-1">out of 100</span>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvement">Improvement</TabsTrigger>
              <TabsTrigger value="actionable">Actionable</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Overall Feedback</h3>
              <p className="text-gray-700 whitespace-pre-line">{feedback}</p>
            </TabsContent>
            
            <TabsContent value="strengths" className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Your Strengths</h3>
              <ul className="space-y-2">
                {evaluationStrengths && evaluationStrengths.length > 0 ? (
                  evaluationStrengths.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-green-500 shrink-0 mr-1" />
                      <span>{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific strengths highlighted.</li>
                )}
              </ul>
            </TabsContent>
            
            <TabsContent value="improvement" className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Areas for Improvement</h3>
              <ul className="space-y-2">
                {evaluationImprovements && evaluationImprovements.length > 0 ? (
                  evaluationImprovements.map((improvement, i) => (
                    <li key={i} className="flex items-start">
                      <XCircle className="h-5 w-5 text-amber-500 shrink-0 mr-1" />
                      <span>{improvement}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific areas for improvement highlighted.</li>
                )}
              </ul>
            </TabsContent>
            
            <TabsContent value="actionable" className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Actionable Steps</h3>
              <ul className="space-y-2">
                {evaluationActionable && evaluationActionable.length > 0 ? (
                  evaluationActionable.map((action, i) => (
                    <li key={i} className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-500 shrink-0 mr-1" />
                      <span>{action}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific actionable steps provided.</li>
                )}
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button onClick={handleClose}>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationResults;
