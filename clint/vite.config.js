import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';

const reactPath = fileURLToPath(new URL('./node_modules/react', import.meta.url));
const reactDomPath = fileURLToPath(new URL('./node_modules/react-dom', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      react: reactPath,
      'react-dom': reactDomPath,
    }
  }
});
