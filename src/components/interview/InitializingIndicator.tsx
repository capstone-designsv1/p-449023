
import React from "react";

const InitializingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-pulse text-center">
        <p className="text-gray-500">Initializing interview...</p>
      </div>
    </div>
  );
};

export default InitializingIndicator;
