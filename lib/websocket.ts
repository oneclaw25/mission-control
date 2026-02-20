/**
 * WebSocket client for real-time updates from OpenClaw Gateway
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketEventType = 
  | 'agent.status_changed'
  | 'task.updated'
  | 'memory.added'
  | 'session.started'
  | 'session.completed'
  | 'cron.triggered'
  | 'model.switched'
  | 'connected'
  | 'disconnected';

export interface WebSocketEvent {
  type: WebSocketEventType;
  timestamp: string;
  data?: any;
}

type EventHandler = (event: WebSocketEvent) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string = 'ws://127.0.0.1:18789';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<WebSocketEventType, Set<EventHandler>> = new Map();
  private isConnecting = false;

  constructor(url?: string) {
    if (url) this.url = url;
  }

  connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
    
    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to OpenClaw Gateway');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.emit({ type: 'connected', timestamp: new Date().toISOString() });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit({
            type: data.type || 'session.completed',
            timestamp: data.timestamp || new Date().toISOString(),
            data,
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit({ type: 'disconnected', timestamp: new Date().toISOString() });
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  on(event: WebSocketEventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  private emit(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
}

// React hook for WebSocket events
export function useWebSocket(eventType: WebSocketEventType, handler: EventHandler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const client = getWebSocketClient();
    
    if (!client.isConnected()) {
      client.connect();
    }
    
    return client.on(eventType, (event) => {
      handlerRef.current(event);
    });
  }, [eventType]);
}

// React hook for connection status
export function useWebSocketStatus(): boolean {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = getWebSocketClient();
    
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    const unsubscribeConnect = client.on('connected', handleConnect);
    const unsubscribeDisconnect = client.on('disconnected', handleDisconnect);
    
    // Check initial state
    setIsConnected(client.isConnected());
    
    if (!client.isConnected()) {
      client.connect();
    }
    
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  return isConnected;
}

export default WebSocketClient;
