// Netlify Function: /api/chat
import { handleChat } from '../../server/chat.js';

export default (request: Request) => handleChat(request);

export const config = { path: '/api/chat' };
