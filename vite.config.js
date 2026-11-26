import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  build: {
    target: 'es2020', outDir: 'dist', sourcemap: false,
    // The inspection frame is present only in protected Vercel previews.
    rolldownOptions: process.env.VERCEL_ENV === 'preview'
      ? { input: ['index.html', 'qa-frame.html'] }
      : undefined,
  },
});
