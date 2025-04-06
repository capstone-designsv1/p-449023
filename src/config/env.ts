
export const env = {
  ELEVEN_LABS_API_KEY: import.meta.env.VITE_ELEVEN_LABS_API_KEY || 'sk_c39b982b7211934bbaa48a89263948f1ad2620459acd845e',
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
