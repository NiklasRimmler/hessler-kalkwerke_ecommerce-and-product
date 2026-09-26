// Baut die Demo als eine einzige HTML-Datei (dist-single/index.html), die per Doppelklick
// ohne Server geöffnet werden kann. Der Chat ist darin naturgemäß deaktiviert.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist-single', assetsInlineLimit: 100_000_000 },
});
