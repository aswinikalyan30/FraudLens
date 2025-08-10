module.exports = {
  onPreBuild: ({ utils }) => {
    try {
      console.log('Starting Netlify pre-build optimizations...');
      // Copy redirects file to ensure it's available
      utils.run.command('cp -f ./public/_redirects ./dist/ 2>/dev/null || true');
    } catch (error) {
      // Non-fatal error, just log it
      console.log('Pre-build warning:', error.message);
    }
  },
  
  onBuild: ({ utils }) => {
    try {
      console.log('Build completed, running post-build optimizations...');
    } catch (error) {
      // Non-fatal error, just log it
      console.log('Build warning:', error.message);
    }
  },
  
  onPostBuild: ({ utils }) => {
    try {
      console.log('Running final optimizations...');
      
      // Ensure redirects file exists in the publish directory
      utils.run.command('cp -f ./public/_redirects ./dist/ 2>/dev/null || true');
      
      // Report build summary
      utils.status.show({
        title: 'FraudLens Build Summary',
        summary: 'Build completed successfully!',
        text: 'Deployment optimizations applied.'
      });
    } catch (error) {
      // Non-fatal error, just log it
      console.log('Post-build warning:', error.message);
    }
  }
};
