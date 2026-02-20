// pages/api/socket/io.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

// Extend Socket type to include custom properties
interface AgentSocket extends Socket {
  agentId?: string;
  agentName?: string;
}

// Store for active connections
const connectedAgents = new Map<string, any>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use type assertion for socket access
  const socket = (res as any).socket;
  
  // Check if Socket.IO is already initialized
  if (socket?.server?.io) {
    return res.status(200).json({ 
      success: true, 
      status: 'already-initialized',
      connectedAgents: connectedAgents.size 
    });
  }

  try {
    // Initialize Socket.IO
    const io = new SocketIOServer(socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Store reference
    socket.server.io = io;

    // Handle connections
    io.on('connection', (socket: AgentSocket) => {
      console.log('Client connected:', socket.id);
      
      // Agent identification
      socket.on('identify', (data: { agentId: string; agentName?: string }) => {
        const { agentId, agentName } = data;
        socket.agentId = agentId;
        socket.agentName = agentName || agentId;
        connectedAgents.set(agentId, {
          socketId: socket.id,
          agentId,
          agentName: socket.agentName,
          connectedAt: new Date().toISOString()
        });
        
        // Broadcast agent online
        io.emit('agent:online', { agentId, agentName: socket.agentName });
        console.log(`Agent ${agentId} identified`);
      });

      // Handle messages
      socket.on('message', (data: { to?: string; content: string; type?: string }) => {
        const message = {
          id: `${socket.id}-${Date.now()}`,
          from: socket.agentId || socket.id,
          fromName: socket.agentName || 'Unknown',
          to: data.to,
          content: data.content,
          type: data.type || 'text',
          timestamp: new Date().toISOString()
        };

        if (data.to) {
          // Direct message
          const targetAgent = connectedAgents.get(data.to);
          if (targetAgent) {
            io.to(targetAgent.socketId).emit('message', message);
          }
          // Also send back to sender
          socket.emit('message:sent', message);
        } else {
          // Broadcast to all
          io.emit('message', message);
        }
      });

      // Handle typing indicator
      socket.on('typing', (data: { to?: string; isTyping: boolean }) => {
        const typingEvent = {
          agentId: socket.agentId,
          agentName: socket.agentName,
          isTyping: data.isTyping
        };
        
        if (data.to) {
          const targetAgent = connectedAgents.get(data.to);
          if (targetAgent) {
            io.to(targetAgent.socketId).emit('typing', typingEvent);
          }
        } else {
          socket.broadcast.emit('typing', typingEvent);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (socket.agentId) {
          connectedAgents.delete(socket.agentId);
          io.emit('agent:offline', { agentId: socket.agentId });
        }
      });
    });

    return res.status(200).json({ 
      success: true, 
      status: 'initialized',
      connectedAgents: 0 
    });
  } catch (error) {
    console.error('Socket.IO initialization error:', error);
    return res.status(500).json({ error: 'Failed to initialize WebSocket' });
  }
}

// Disable body parsing for WebSocket upgrade
export const config = {
  api: {
    bodyParser: false,
  },
};
