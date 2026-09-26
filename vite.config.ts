import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleChat } from './server/chat.js';

// Stellt /api/chat auch im lokalen Dev-Server bereit (in Produktion: api/chat.ts bzw. Netlify-Funktion).
function chatDevApi(): Plugin {
  return {
    name: 'chat-dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const request = new Request('http://localhost/api/chat', {
          method: req.method,
          headers: { 'content-type': 'application/json' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const response = await handleChat(request);
        res.statusCode = response.status;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), chatDevApi()],
  test: { include: ['tests/**/*.test.ts'] },
});
