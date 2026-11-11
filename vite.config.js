import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Si usas GitHub Pages, cambia 'edurural' por el nombre de tu repositorio
  // base: '/edurural/',

  build: {
    rollupOptions: {
      output: {
        // manualChunks debe ser una función en Vite 8 / Rolldown
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/recharts')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'pdf-vendor';
          }
          if (id.includes('node_modules/xlsx')) {
            return 'excel-vendor';
          }
        },
      },
    },
  },

  server: {
    host: true,
    hmr: { overlay: false },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
})
