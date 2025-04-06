
export const env = {
  ELEVEN_LABS_API_KEY: import.meta.env.VITE_ELEVEN_LABS_API_KEY || '',
  // Add other environment variables as needed
};

// Helper function to check if environment variables are properly loaded
export const checkEnvVariables = () => {
  const missingVars = [];
  
  if (!import.meta.env.VITE_ELEVEN_LABS_API_KEY) {
    missingVars.push('VITE_ELEVEN_LABS_API_KEY');
  }
  
  return {
    allPresent: missingVars.length === 0,
    missingVars
  };
};
