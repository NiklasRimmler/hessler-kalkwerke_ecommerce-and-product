// Vercel Serverless Function (Node.js, Web-Standard-Signatur): /api/chat
import { handleChat } from '../server/chat.js';

export function GET(request: Request) {
  return handleChat(request);
}

export function POST(request: Request) {
  return handleChat(request);
}
