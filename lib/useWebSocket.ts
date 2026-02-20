import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  from: string;
  fromName: string;
  to?: string;
  content: string;
  type: string;
  timestamp: string;
}

interface Agent {
  agentId: string;
  agentName: string;
  connectedAt: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  onlineAgents: Map<string, Agent>;
  typingAgents: Set<string>;
  sendMessage: (content: string, to?: string) => void;
  setTyping: (isTyping: boolean, to?: string) => void;
  identify: (agentId: string, agentName?: string) => void;
  error: string | null;
}

export function useWebSocket(agentId?: string, agentName?: string): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineAgents, setOnlineAgents] = useState<Map<string, Agent>>(new Map());
  const [typingAgents, setTypingAgents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const initSocket = async () => {
      try {
        // First, initialize the Socket.IO server endpoint
        await fetch('/api/socket/io');
        
        // Then connect
        const socket = io({
          path: '/api/socket/io',
          addTrailingSlash: false,
          transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
          
          // Identify if agent info provided
          if (agentId) {
            socket.emit('identify', { agentId, agentName });
          }
        });

        socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
          console.error('WebSocket connection error:', err);
          setError('Connection failed. Retrying...');
        });

        socket.on('message', (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });

        socket.on('agent:online', (agent: Agent) => {
          setOnlineAgents((prev) => {
            const next = new Map(prev);
            next.set(agent.agentId, agent);
            return next;
          });
        });

        socket.on('agent:offline', ({ agentId }: { agentId: string }) => {
          setOnlineAgents((prev) => {
            const next = new Map(prev);
            next.delete(agentId);
            return next;
          });
        });

        socket.on('typing', ({ agentId, isTyping }: { agentId: string; isTyping: boolean }) => {
          setTypingAgents((prev) => {
            const next = new Set(prev);
            if (isTyping) {
              next.add(agentId);
            } else {
              next.delete(agentId);
            }
            return next;
          });
        });
      } catch (err) {
        console.error('Socket initialization error:', err);
        setError('Failed to initialize WebSocket');
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [agentId, agentName]);

  const sendMessage = useCallback((content: string, to?: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', { content, to });
    }
  }, [isConnected]);

  const setTyping = useCallback((isTyping: boolean, to?: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { isTyping, to });
    }
  }, [isConnected]);

  const identify = useCallback((id: string, name?: string) => {
    if (socketRef.current) {
      socketRef.current.emit('identify', { agentId: id, agentName: name });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    onlineAgents,
    typingAgents,
    sendMessage,
    setTyping,
    identify,
    error,
  };
}
