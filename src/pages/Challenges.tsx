
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<"Junior" | "Senior" | "Lead">("Junior");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("E-commerce");
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeDetails | null>(null);
  
  const { 
    challenge, 
    isLoading, 
    error, 
    generateChallenge 
  } = useChallengeGenerator({
    designLevel: selectedLevel,
    industry: selectedIndustry
  });
  
  useEffect(() => {
    // Generate a challenge when the component mounts or when selection changes
    generateChallenge().then(result => {
      if (result) {
        setCurrentChallenge(result);
      }
    });
  }, [selectedLevel, selectedIndustry]);
  
  const handleRefreshChallenge = () => {
    generateChallenge().then(result => {
      if (result) {
        setCurrentChallenge(result);
      }
    });
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
            <Tabs 
              defaultValue={selectedLevel} 
              value={selectedLevel}
              onValueChange={(value) => setSelectedLevel(value as "Junior" | "Senior" | "Lead")}
              className="mb-4"
            >
              <TabsList className="bg-gray-100 w-full">
                <TabsTrigger value="Junior" className="text-lg flex-1">Junior</TabsTrigger>
                <TabsTrigger value="Senior" className="text-lg flex-1">Senior</TabsTrigger>
                <TabsTrigger value="Lead" className="text-lg flex-1">Lead</TabsTrigger>
              </TabsList>
            </Tabs>
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
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your Challenge</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshChallenge}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Generate New
        </Button>
      </div>
      
      {isLoading ? (
        <Card className="overflow-hidden border border-gray-200">
          <CardHeader className="pb-4">
            <Skeleton className="h-7 w-2/3 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-1/3" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="overflow-hidden border border-gray-200 bg-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Error Generating Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-600">{error}</p>
            <Button 
              onClick={handleRefreshChallenge}
              className="bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-8 py-[18px] rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : currentChallenge ? (
        <Card className="overflow-hidden border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold">{currentChallenge.title}</CardTitle>
                <CardDescription className="text-base mt-1">
                  By {currentChallenge.company} · {selectedLevel} · {selectedIndustry}
                </CardDescription>
              </div>
              <div className="bg-[rgba(233,231,252,1)] px-3 py-1 rounded-full text-sm border border-[rgba(25,71,229,1)]">
                {selectedLevel}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{currentChallenge.description}</p>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {currentChallenge.instructions.map((instruction, index) => (
                  <li key={index} className="text-gray-700">{instruction}</li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={() => handleStartChallenge(currentChallenge)}
              className="bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-8 py-[18px] rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors"
            >
              Start Challenge
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default Challenges;
