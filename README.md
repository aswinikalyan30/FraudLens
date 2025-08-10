# FraudLens

A React application for fraud detection and management in educational applications.

## Deployment to Netlify

This project is configured for easy deployment to Netlify. Follow these steps to deploy:

### Option 1: Deploy via Netlify UI

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Netlify account
3. Click "New site from Git"
4. Select your repository and branch
5. Build settings will be automatically detected from netlify.toml
6. Click "Deploy site"

### Option 2: Deploy using Netlify CLI

1. Install Netlify CLI: `npm install netlify-cli -g`
2. Login to Netlify: `netlify login`
3. Initialize your site: `netlify init`
4. Deploy the site: `netlify deploy --prod`

## Environment Variables

Configure these environment variables in the Netlify dashboard under Site Settings > Build & Deploy > Environment:

- `REACT_APP_API_URL`: URL for your API backend
- `REACT_APP_ENVIRONMENT`: Application environment (production, staging, etc.)

## Build Configuration

The build is configured in the following files:

- `netlify.toml`: Main configuration file for Netlify
- `netlify.context.toml`: Context-specific environment settings
- `netlify.env.js`: JavaScript helper for Netlify-specific configurations
- `.env.production`: Production environment variables

## Custom Redirects

The application includes proper redirects for SPA routing:
- All routes are redirected to `index.html` with a 200 status code
- This ensures deep-linking works correctly

## Optimizations

The Vite build configuration includes:
- Code splitting for vendor chunks
- Sourcemap generation for better debugging
- Path aliasing for cleaner imports

## Troubleshooting

If you encounter any deployment issues:

1. Check the Netlify deploy logs
2. Verify your node/npm versions in netlify.context.toml match your local environment
3. Ensure all environment variables are set correctly
4. Try running a local build with `npm run build` to identify any issues
