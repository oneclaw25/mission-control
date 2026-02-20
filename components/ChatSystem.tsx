import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  MoreVertical,
  Users,
  Wifi,
  WifiOff,
  Bot,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useWebSocket } from '../lib/useWebSocket';

interface ChatMessage {
  id: string;
  from: string;
  fromName: string;
  to?: string;
  content: string;
  type: string;
  timestamp: string;
}

interface Agent {
  id: string;
  name: string;
  icon: string;
  status: 'online' | 'offline' | 'busy' | 'idle';
  model: string;
}

const AGENT_ICONS: Record<string, string> = {
  'oneclaw': '☁️',
  'bossclaw': '🖥️',
  'architect': '🏗️',
  'builder': '🔨',
  'money-maker': '💰',
  'operator': '⚙️',
  'money maker': '💰',
};

export default function ChatSystem() {
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(new Set());
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [teamMessages, setTeamMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  
  const { 
    isConnected, 
    messages: wsMessages, 
    onlineAgents,
    typingAgents,
    sendMessage: sendWsMessage,
    setTyping,
    identify,
    error 
  } = useWebSocket('user', 'User');

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        const formattedAgents = data.agents.map((a: any) => ({
          id: a.id,
          name: a.name || a.id,
          icon: AGENT_ICONS[a.id.toLowerCase()] || '🤖',
          status: a.status || 'offline',
          model: a.model || 'unknown'
        }));
        setAgents(formattedAgents);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
    // Refresh every 10 seconds
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Identify on mount
  useEffect(() => {
    if (isConnected) {
      identify('user', 'User');
    }
  }, [isConnected, identify]);

  // Process incoming WebSocket messages
  useEffect(() => {
    wsMessages.forEach((msg) => {
      // Add to individual chat if it's a direct message
      if (msg.to) {
        setChatHistories(prev => ({
          ...prev,
          [msg.from]: [...(prev[msg.from] || []), msg]
        }));
      } else {
        // Add to team chat
        setTeamMessages(prev => [...prev, msg]);
      }
    });
  }, [wsMessages]);

  const openChat = (agentId: string) => {
    if (!openChats.includes(agentId)) {
      setOpenChats([...openChats, agentId]);
    }
    setActiveChat(agentId);
    setMinimizedChats(prev => {
      const next = new Set(prev);
      next.delete(agentId);
      return next;
    });
  };

  const closeChat = (agentId: string) => {
    setOpenChats(openChats.filter(id => id !== agentId));
    if (activeChat === agentId) {
      setActiveChat(null);
    }
  };

  const toggleMinimize = (agentId: string) => {
    setMinimizedChats(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
        setActiveChat(agentId);
      } else {
        next.add(agentId);
        if (activeChat === agentId) {
          setActiveChat(null);
        }
      }
      return next;
    });
  };

  const sendChatMessage = (agentId: string, content: string) => {
    // Add to local history immediately
    const localMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      from: 'user',
      fromName: 'You',
      to: agentId,
      content,
      type: 'text',
      timestamp: new Date().toISOString()
    };
    
    setChatHistories(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), localMsg]
    }));
    
    // Send via WebSocket
    sendWsMessage(content, agentId);
  };

  const sendTeamMessage = (content: string) => {
    const localMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      from: 'user',
      fromName: 'You',
      content,
      type: 'text',
      timestamp: new Date().toISOString()
    };
    
    setTeamMessages(prev => [...prev, localMsg]);
    sendWsMessage(content);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Chat System</h2>
          <p className="text-gray-400 flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Disconnected</span>
              </>
            )}
            {error && <span className="text-red-400">• {error}</span>}
          </p>
        </div>
        <button
          onClick={() => setShowTeamChat(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Users className="w-4 h-4" />
          Team Chat
          {teamMessages.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {teamMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* Online Agents */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Online Agents ({onlineAgents.size})
        </h3>
        <div className="flex flex-wrap gap-3">
          {Array.from(onlineAgents.values()).map((agent) => (
            <div 
              key={agent.agentId}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">{agent.agentName}</span>
            </div>
          ))}
          {onlineAgents.size === 0 && (
            <p className="text-gray-600 text-sm">No agents currently online</p>
          )}
        </div>
      </div>

      {/* Agent List */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No agents available</div>
        ) : agents.map((agent) => {
          const isOnline = onlineAgents.has(agent.id);
          const isChatOpen = openChats.includes(agent.id);
          const hasHistory = (chatHistories[agent.id]?.length || 0) > 0;
          const unreadCount = chatHistories[agent.id]?.filter(m => m.from !== 'user').length || 0;
          
          return (
            <div 
              key={agent.id}
              onClick={() => openChat(agent.id)}
              className={`bg-gray-900 rounded-xl p-5 border cursor-pointer transition-all ${
                isChatOpen 
                  ? 'border-blue-500/50 ring-1 ring-blue-500/30' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-500">{agent.model}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-green-500' : 
                  agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  isOnline ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {isOnline ? 'Online' : agent.status}
                </span>
                
                <div className="flex items-center gap-2">
                  {hasHistory && (
                    <span className="text-xs text-gray-500">
                      {chatHistories[agent.id]?.length} messages
                    </span>
                  )}
                  {unreadCount > 0 && !isChatOpen && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {isChatOpen && (
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Chat Windows */}
      {openChats.length > 0 && (
        <div className="fixed bottom-4 right-4 flex gap-3 z-40">
          {openChats.map((agentId) => (
            <ChatWindow
              key={agentId}
              agent={agents.find(a => a.id === agentId)!}
              messages={chatHistories[agentId] || []}
              isMinimized={minimizedChats.has(agentId)}
              isActive={activeChat === agentId}
              isTyping={typingAgents.has(agentId)}
              isOnline={onlineAgents.has(agentId)}
              onClose={() => closeChat(agentId)}
              onMinimize={() => toggleMinimize(agentId)}
              onActivate={() => setActiveChat(agentId)}
              onSendMessage={(content) => sendChatMessage(agentId, content)}
            />
          ))}
        </div>
      )}

      {/* Team Chat Modal */}
      {showTeamChat && (
        <TeamChatModal
          messages={teamMessages}
          onlineAgents={onlineAgents}
          onClose={() => setShowTeamChat(false)}
          onSendMessage={sendTeamMessage}
        />
      )}
    </div>
  );
}

// Chat Window Component
function ChatWindow({ 
  agent, 
  messages, 
  isMinimized, 
  isActive,
  isTyping,
  isOnline,
  onClose, 
  onMinimize,
  onActivate,
  onSendMessage 
}: {
  agent: Agent;
  messages: ChatMessage[];
  isMinimized: boolean;
  isActive: boolean;
  isTyping: boolean;
  isOnline: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onActivate: () => void;
  onSendMessage: (content: string) => void;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  if (isMinimized) {
    return (
      <div 
        onClick={onMinimize}
        className="bg-gray-900 border border-gray-700 rounded-t-xl shadow-2xl w-64 cursor-pointer hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span>{agent.icon}</span>
            <span className="text-sm font-medium text-white">{agent.name}</span>
            {messages.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 text-gray-400" />
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gray-900 border border-gray-700 rounded-t-xl shadow-2xl flex flex-col ${
        isActive ? 'w-80 h-[450px]' : 'w-72 h-[400px]'
      } transition-all`}
      onClick={onActivate}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-lg">{agent.icon}</span>
          <div>
            <span className="text-sm font-medium text-white">{agent.name}</span>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-xs text-gray-500">{isOnline ? 'online' : 'offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMinimize} className="p-1 hover:bg-gray-700 rounded">
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start chatting with {agent.name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${
                msg.from === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}>
                <p>{msg.content}</p>
                <span className="text-xs opacity-50 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-300 p-2.5 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Team Chat Modal
function TeamChatModal({ 
  messages, 
  onlineAgents,
  onClose, 
  onSendMessage 
}: {
  messages: ChatMessage[];
  onlineAgents: Map<string, any>;
  onClose: () => void;
  onSendMessage: (content: string) => void;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const getAgentIcon = (agentId: string) => {
    return AGENT_ICONS[agentId.toLowerCase()] || '🤖';
  };

  const getAgentName = (agentId: string) => {
    // Capitalize first letter and replace hyphens with spaces
    return agentId.charAt(0).toUpperCase() + agentId.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Team Chat</h3>
              <p className="text-sm text-gray-500">
                {onlineAgents.size} online • {messages.length} messages
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Online Agents */}
        <div className="px-6 py-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Online:</span>
            <div className="flex gap-2">
              {Array.from(onlineAgents.values()).map((agent) => (
                <div 
                  key={agent.agentId}
                  className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg"
                >
                  <span className="text-sm">{getAgentIcon(agent.agentId)}</span>
                  <span className="text-sm text-green-400">{agent.agentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Team Chat</p>
              <p className="text-sm mt-2">Send a message to all agents</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="text-2xl">
                  {msg.from === 'user' ? '👤' : getAgentIcon(msg.from)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {msg.from === 'user' ? 'You' : getAgentName(msg.from)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-gray-300 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message all agents..."
              className="flex-1 px-4 py-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Send All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
