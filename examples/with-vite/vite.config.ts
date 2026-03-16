import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { jankMeter } from 'jankmeter/vite';

export default defineConfig({
  plugins: [react(), jankMeter()],
});
