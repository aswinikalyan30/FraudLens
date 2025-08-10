// This file sets Netlify-specific environment variables and configurations
// It can be imported and used in your Vite config or other build scripts

export const isNetlify = process.env.NETLIFY === 'true';

// Add any Netlify-specific environment configurations here
export const netlifyConfig = {
  // Example: you might want to set different API endpoints for production vs preview deploys
  apiBaseUrl: process.env.CONTEXT === 'production' 
    ? 'https://api.fraudlens.com/v1' 
    : 'https://staging-api.fraudlens.com/v1',
  
  // This helps with debugging
  buildContext: process.env.CONTEXT || 'local',
};
