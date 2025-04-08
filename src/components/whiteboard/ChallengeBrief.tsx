
import React from "react";

interface ChallengeBriefProps {
  title: string;
  description: string;
}

const ChallengeBrief: React.FC<ChallengeBriefProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-700 whitespace-pre-line">{description}</p>
    </div>
  );
};

export default ChallengeBrief;
