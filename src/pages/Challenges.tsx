
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useChallengeGenerator } from "@/hooks/useChallengeGenerator";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { ChallengeDetails } from "@/context/ChallengeContext";

const industries = [
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Education",
  "Social Media",
  "Travel",
  "Entertainment",
  "Productivity",
  "Food & Beverage",
  "Transportation"
];

const designerLevels = ["Junior", "Senior", "Lead"];

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<"Junior" | "Senior" | "Lead">("Junior");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("E-commerce");
  const [challenges, setChallenges] = useState<ChallengeDetails[]>([]);
  
  const { 
    isLoading, 
    error, 
    generateChallenge 
  } = useChallengeGenerator({
    designLevel: selectedLevel,
    industry: selectedIndustry
  });
  
  const handleGenerateChallenges = async () => {
    try {
      setChallenges([]);
      // Generate 3 challenges at once
      const results = await Promise.all([
        generateChallenge(),
        generateChallenge(),
        generateChallenge()
      ]);
      
      // Filter out any null results
      const validResults = results.filter(Boolean) as ChallengeDetails[];
      setChallenges(validResults);
    } catch (error) {
      console.error("Error generating challenges:", error);
    }
  };
  
  const handleStartChallenge = (challenge: ChallengeDetails) => {
    // Store the current challenge in session storage before navigating
    sessionStorage.setItem('currentChallenge', JSON.stringify(challenge));
    navigate(`/whiteboard/${challenge.id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      <h1 className="text-4xl font-bold mb-2 text-[rgba(25,26,35,1)]">Design Practice Challenges</h1>
      <p className="text-xl mb-8 text-[rgba(28,14,13,1)]">
        Practice real-world product design challenges from top companies.
      </p>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="designer-level" className="mb-2 block text-gray-700">Designer Level</Label>
            <Select 
              value={selectedLevel} 
              onValueChange={(value) => setSelectedLevel(value as "Junior" | "Senior" | "Lead")}
            >
              <SelectTrigger id="designer-level" className="w-full">
                <SelectValue placeholder="Select designer level" />
              </SelectTrigger>
              <SelectContent>
                {designerLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="industry" className="mb-2 block text-gray-700">Industry</Label>
            <Select 
              value={selectedIndustry} 
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger id="industry" className="w-full">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleGenerateChallenges}
            disabled={isLoading}
            size="lg"
            className="bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-8 py-[18px] rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Generating Challenges...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Generate Challenges
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error ? (
        <Card className="overflow-hidden border border-gray-200 bg-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Error Generating Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-600">{error}</p>
            <Button 
              onClick={handleGenerateChallenges}
              className="bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-8 py-[18px] rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6">Available Challenges</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border border-gray-200">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-7 w-2/3 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            By {challenge.company} · {selectedLevel} · {selectedIndustry}
                          </CardDescription>
                        </div>
                        <div className="bg-[rgba(233,231,252,1)] px-3 py-1 rounded-full text-sm border border-[rgba(25,71,229,1)]">
                          {selectedLevel}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="mb-4 flex-1">{challenge.description}</p>
                      
                      <Button 
                        onClick={() => handleStartChallenge(challenge)}
                        className="mt-auto bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-6 py-3 rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors"
                      >
                        Start Challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No challenges generated yet</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Challenges;
