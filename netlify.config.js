/**
 * Netlify Environment Configuration
 * This file exports configuration that can be used in build scripts
 */

module.exports = {
  // Environment settings for different deployment contexts
  contexts: {
    production: {
      environment: { 
        NODE_ENV: "production", 
        REACT_APP_ENVIRONMENT: "production" 
      }
    },
    "deploy-preview": {
      environment: { 
        NODE_ENV: "production", 
        REACT_APP_ENVIRONMENT: "preview" 
      }
    },
    "branch-deploy": {
      environment: { 
        NODE_ENV: "production", 
        REACT_APP_ENVIRONMENT: "staging" 
      }
    }
  },
  
  // Build environment settings
  buildEnvironment: {
    NODE_VERSION: "20",
    NPM_VERSION: "10"
  }
};
