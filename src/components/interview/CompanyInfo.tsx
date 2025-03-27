
import React from "react";

export interface CompanyInfoType {
  id: string;
  name: string;
  logo: string;
  description: string;
}

interface CompanyInfoProps {
  company: CompanyInfoType;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ company }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Interview Simulation</h2>
      <p className="text-gray-600 mb-4">
        Practice a design interview with an AI interviewer from {company.name}. 
        Select your experience level to get started.
      </p>
    </div>
  );
};

export default CompanyInfo;
