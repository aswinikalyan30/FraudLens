import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Configure development server
  server: {
    proxy: {
      '/api/aws': {
        target: 'https://4xituwvy3i.execute-api.us-east-1.amazonaws.com/dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aws/, ''),
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
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
