
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Challenge {
  id: string;
  title: string;
  company: string;
  level: "Junior" | "Senior" | "Lead";
  description: string;
  duration: string;
  type: "whiteboard" | "interview";
}

const sampleChallenges: Challenge[] = [
  {
    id: "uber-1",
    title: "Redesign the Ride Ordering Experience",
    company: "Uber",
    level: "Junior",
    description: "Create a simplified ride ordering flow that improves the user experience for first-time users.",
    duration: "45 min",
    type: "whiteboard"
  },
  {
    id: "airbnb-1",
    title: "Design a New Feature for Hosts",
    company: "Airbnb",
    level: "Senior",
    description: "Design a feature that helps hosts better manage their property bookings and guest communications.",
    duration: "60 min",
    type: "whiteboard"
  },
  {
    id: "meta-1",
    title: "Improve Group Interaction in VR",
    company: "Meta",
    level: "Lead",
    description: "Conceptualize improvements to how users interact in group settings within a VR environment.",
    duration: "90 min",
    type: "whiteboard"
  },
  {
    id: "uber-2",
    title: "Design for Accessibility",
    company: "Uber",
    level: "Senior",
    description: "Improve accessibility of the app for users with visual impairments.",
    duration: "60 min",
    type: "whiteboard"
  },
  {
    id: "airbnb-2",
    title: "Streamline the Booking Process",
    company: "Airbnb",
    level: "Junior",
    description: "Simplify the booking flow to reduce drop-offs and increase conversion.",
    duration: "45 min",
    type: "whiteboard"
  },
  {
    id: "meta-2",
    title: "Cross-Platform Design System",
    company: "Meta",
    level: "Lead",
    description: "Design a system that maintains consistent user experience across mobile, desktop, and VR.",
    duration: "90 min",
    type: "whiteboard"
  },
  // Interview challenges
  {
    id: "uber",
    title: "AI Interview: Product Design at Uber",
    company: "Uber",
    level: "Junior",
    description: "Practice a realistic product design interview with an AI interviewer from Uber.",
    duration: "30 min",
    type: "interview"
  },
  {
    id: "airbnb",
    title: "AI Interview: Product Design at Airbnb",
    company: "Airbnb",
    level: "Senior",
    description: "Get interviewed by an AI simulating an Airbnb product design interviewer.",
    duration: "30 min",
    type: "interview"
  },
  {
    id: "meta",
    title: "AI Interview: Product Design at Meta",
    company: "Meta",
    level: "Lead",
    description: "Practice your interview skills with an AI that simulates a Meta design interviewer.",
    duration: "30 min",
    type: "interview"
  }
];

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<"Junior" | "Senior" | "Lead">("Junior");
  const [challengeType, setChallengeType] = useState<"whiteboard" | "interview">("whiteboard");
  
  const filteredChallenges = sampleChallenges.filter(
    challenge => challenge.level === selectedLevel && challenge.type === challengeType
  );
  
  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.type === "whiteboard") {
      navigate(`/whiteboard/${challenge.id}`);
    } else {
      navigate(`/interview/${challenge.id}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" style={{ fontFamily: "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif" }}>
      <h1 className="text-4xl font-bold mb-2 text-[rgba(25,26,35,1)]">Design Practice Challenges</h1>
      <p className="text-xl mb-8 text-[rgba(28,14,13,1)]">
        Practice real-world product design challenges from top companies.
      </p>
      
      <div className="mb-6">
        <Tabs defaultValue="whiteboard" onValueChange={(value) => setChallengeType(value as "whiteboard" | "interview")}>
          <TabsList className="mb-4">
            <TabsTrigger value="whiteboard" className="text-lg px-6">Whiteboard Challenges</TabsTrigger>
            <TabsTrigger value="interview" className="text-lg px-6">AI Interviews</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Tabs defaultValue="Junior" onValueChange={(value) => setSelectedLevel(value as "Junior" | "Senior" | "Lead")}>
        <TabsList className="mb-8 bg-gray-100">
          <TabsTrigger value="Junior" className="text-lg px-6">Junior Designer</TabsTrigger>
          <TabsTrigger value="Senior" className="text-lg px-6">Senior Designer</TabsTrigger>
          <TabsTrigger value="Lead" className="text-lg px-6">Lead Designer</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedLevel} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        By {challenge.company} · {challenge.duration}
                      </CardDescription>
                    </div>
                    <div className="bg-[rgba(233,231,252,1)] px-3 py-1 rounded-full text-sm border border-[rgba(25,71,229,1)]">
                      {challenge.level}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{challenge.description}</p>
                  <Button 
                    onClick={() => handleStartChallenge(challenge)}
                    className="bg-[rgba(97,228,197,1)] border gap-2.5 text-black px-8 py-[18px] rounded-[15px] border-black border-solid hover:bg-[rgba(77,208,177,1)] transition-colors"
                  >
                    Start Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Challenges;
