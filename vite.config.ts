import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Ensure that the base path is set correctly for Netlify deployments
  base: '/',
  // Improve build settings for production
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Improve chunk loading strategy
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'ui-components': ['@radix-ui/react-slot', 'class-variance-authority', 'tailwind-merge']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
});
