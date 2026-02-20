import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory message store per agent
interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
}

const messageStore = new Map<string, ChatMessage[]>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Get chat history for agent
        const messages = messageStore.get(id) || [];
        
        return res.status(200).json({
          agentId: id,
          messages: messages.slice(-100), // Last 100 messages
          total: messages.length
        });
      }
      
      case 'POST': {
        const { content, role = 'user', agentName } = req.body;
        
        if (!content) {
          return res.status(400).json({ error: 'Message content is required' });
        }
        
        const messages = messageStore.get(id) || [];
        
        const message: ChatMessage = {
          id: `${id}-${Date.now()}`,
          role,
          content,
          timestamp: new Date().toISOString(),
          agentId: id,
          agentName
        };
        
        messages.push(message);
        messageStore.set(id, messages);
        
        // If user message, simulate agent response
        if (role === 'user') {
          setTimeout(() => {
            const agentMsgs = messageStore.get(id) || [];
            agentMsgs.push({
              id: `${id}-${Date.now()}-response`,
              role: 'agent',
              content: `[Agent ${id}] Received your message:\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\nProcessing...`,
              timestamp: new Date().toISOString(),
              agentId: id,
              agentName: agentName || 'Agent'
            });
            messageStore.set(id, agentMsgs);
          }, 1500);
        }
        
        return res.status(201).json({
          success: true,
          message,
          total: messages.length
        });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export for WebSocket use
export { messageStore };
