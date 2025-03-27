
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyInfoType } from "./CompanyInfo";
import CompanyInfo from "./CompanyInfo";

interface InterviewSetupProps {
  company: CompanyInfoType;
  designLevel: "Junior" | "Senior" | "Lead";
  setDesignLevel: (level: "Junior" | "Senior" | "Lead") => void;
  handleStartInterview: () => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({
  company,
  designLevel,
  setDesignLevel,
  handleStartInterview
}) => {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <CompanyInfo company={company} />

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
  );
};

export default InterviewSetup;
