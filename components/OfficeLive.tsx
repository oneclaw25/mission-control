import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Coffee, 
  MessageSquare, 
  Zap, 
  Clock, 
  Send, 
  X,
  Users,
  CheckSquare,
  Bot,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Play,
  AlertCircle
} from 'lucide-react';
import { useAgents } from '../lib/useAgents';
import { useWebSocket } from '../lib/useWebSocket';

interface SystemResources {
  cpu: {
    count: number;
    usagePercent: number;
  };
  memory: {
    total: number;
    used: number;
    usagePercent: number;
  };
  uptime: number;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  tier: 'primary' | 'secondary' | 'subagent';
  status: 'working' | 'idle' | 'away';
  currentTask?: string;
  model: string;
  avatar: string;
  color: string;
  tasks: { title: string; status: 'todo' | 'in-progress' | 'done' }[];
  cpu?: number;
  memory?: number;
}

const AGENTS: Agent[] = [
  {
    id: 'oneclaw',
    name: 'OneClaw',
    role: 'PRIMARY AGENT',
    tier: 'primary',
    status: 'working',
    currentTask: 'Building Mission Control dashboard',
    model: 'kimi-k2.5',
    avatar: '☁️',
    color: 'from-blue-500 to-blue-600',
    tasks: [
      { title: 'Build Agent Manager', status: 'done' },
      { title: 'Add MiniMax M2.5 support', status: 'done' },
      { title: 'Create Office view', status: 'in-progress' },
      { title: 'Spawn sub-agents', status: 'todo' },
    ],
  },
  {
    id: 'bossclaw',
    name: 'BossClaw',
    role: 'SECONDARY AGENT',
    tier: 'secondary',
    status: 'working',
    currentTask: 'Running MiniMax M2.5 locally',
    model: 'minimax-m2.5',
    avatar: '🖥️',
    color: 'from-purple-500 to-purple-600',
    tasks: [
      { title: 'Setup MiniMax server', status: 'done' },
      { title: 'Configure Voice AI', status: 'in-progress' },
      { title: 'Process local tasks', status: 'todo' },
    ],
  },
  {
    id: 'architect',
    name: 'Architect',
    role: 'SUB-AGENT',
    tier: 'subagent',
    status: 'idle',
    currentTask: 'Available for strategy tasks',
    model: 'claude-opus-4-6',
    avatar: '🏗️',
    color: 'from-gray-500 to-gray-600',
    tasks: [
      { title: 'System design review', status: 'todo' },
      { title: 'Architecture planning', status: 'todo' },
    ],
  },
  {
    id: 'builder',
    name: 'Builder',
    role: 'SUB-AGENT',
    tier: 'subagent',
    status: 'working',
    currentTask: 'Coding Fix AI MVP',
    model: 'kimi-k2.5',
    avatar: '🔨',
    color: 'from-gray-500 to-gray-600',
    tasks: [
      { title: 'Crack detection model', status: 'in-progress' },
      { title: 'Build dashboard UI', status: 'in-progress' },
      { title: 'API integration', status: 'todo' },
    ],
  },
  {
    id: 'money-maker',
    name: 'Money Maker',
    role: 'SUB-AGENT',
    tier: 'subagent',
    status: 'idle',
    currentTask: 'Available for business tasks',
    model: 'claude-sonnet-4-6',
    avatar: '💰',
    color: 'from-gray-500 to-gray-600',
    tasks: [
      { title: 'Pitch deck review', status: 'todo' },
      { title: 'Investor outreach', status: 'todo' },
    ],
  },
  {
    id: 'operator',
    name: 'Operator',
    role: 'SUB-AGENT',
    tier: 'subagent',
    status: 'idle',
    currentTask: 'Available for operations',
    model: 'kimi-k2.5',
    avatar: '⚙️',
    color: 'from-gray-500 to-gray-600',
    tasks: [
      { title: 'System maintenance', status: 'todo' },
      { title: 'Automation scripts', status: 'todo' },
    ],
  },
];

const STATUS_CONFIG = {
  working: {
    color: 'bg-green-500',
    label: 'Working',
    icon: Zap,
  },
  idle: {
    color: 'bg-yellow-500',
    label: 'Idle',
    icon: Coffee,
  },
  away: {
    color: 'bg-gray-500',
    label: 'Away',
    icon: Clock,
  },
};

const TIER_CONFIG = {
  primary: {
    border: 'border-blue-500/50 ring-1 ring-blue-500/30',
    label: 'PRIMARY',
    labelColor: 'bg-blue-600',
  },
  secondary: {
    border: 'border-purple-500/50 ring-1 ring-purple-500/30',
    label: 'SECONDARY',
    labelColor: 'bg-purple-600',
  },
  subagent: {
    border: 'border-gray-700',
    label: 'SUB-AGENT',
    labelColor: 'bg-gray-600',
  },
};

export default function OfficeLive() {
  const { agents: spawnedAgents, activeCount } = useAgents();
  const { onlineAgents, isConnected } = useWebSocket();
  const [resources, setResources] = useState<SystemResources | null>(null);
  const [chatWindows, setChatWindows] = useState<string[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, {role: 'user' | 'agent', content: string, time: Date}[]>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [teamInput, setTeamInput] = useState('');
  const [teamMessages, setTeamMessages] = useState<{agentId: string, agentName: string, content: string, time: Date}[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Fetch system resources
  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      const response = await fetch('/api/system/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setIsLoadingResources(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const openChat = (agentId: string) => {
    if (!chatWindows.includes(agentId)) {
      setChatWindows([...chatWindows, agentId]);
    }
    setActiveChat(agentId);
  };

  const closeChat = (agentId: string) => {
    setChatWindows(chatWindows.filter(id => id !== agentId));
    if (activeChat === agentId) setActiveChat(null);
  };

  const sendMessage = (agentId: string) => {
    const input = inputs[agentId] || '';
    if (!input.trim()) return;

    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) return;

    const userMsg = { role: 'user' as const, content: input, time: new Date() };
    setMessages(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMsg]
    }));
    setInputs({ ...inputs, [agentId]: '' });

    setTimeout(() => {
      const agentMsg = { 
        role: 'agent' as const, 
        content: `[${agent.name} via ${agent.model}]\n\nProcessing: ${input}`,
        time: new Date() 
      };
      setMessages(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), agentMsg]
      }));
    }, 800);
  };

  const sendTeamMessage = () => {
    if (!teamInput.trim()) return;

    AGENTS.forEach((agent, idx) => {
      setTimeout(() => {
        setTeamMessages(prev => [...prev, {
          agentId: agent.id,
          agentName: agent.name,
          content: teamInput,
          time: new Date()
        }]);
      }, idx * 300);
    });
    setTeamInput('');
  };

  const workingCount = AGENTS.filter(a => a.status === 'working').length;
  const idleCount = AGENTS.filter(a => a.status === 'idle').length;
  const awayCount = AGENTS.filter(a => a.status === 'away').length;

  return (
    <div className="h-full relative">
      {/* Floating Chat Windows */}
      {chatWindows.length > 0 && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-40">
          {chatWindows.map(agentId => {
            const agent = AGENTS.find(a => a.id === agentId);
            if (!agent) return null;
            const isActive = activeChat === agentId;
            const agentMessages = messages[agentId] || [];
            const input = inputs[agentId] || '';

            return (
              <div 
                key={agentId}
                className={`bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all ${
                  isActive ? 'w-80 h-[450px]' : 'w-64 h-12'
                }`}
              >
                <div 
                  className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-t-xl cursor-pointer"
                  onClick={() => setActiveChat(isActive ? null : agentId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{agent.avatar}</span>
                    <div>
                      <span className="text-sm font-medium text-white">{agent.name}</span>
                      <span className="text-xs text-gray-500 block">{agent.model}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setActiveChat(isActive ? null : agentId); }}>
                      {isActive ? '−' : '+'}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); closeChat(agentId); }}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                {isActive && (
                  <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                      {agentMessages.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs mt-8">
                          Chat with {agent.name}
                        </p>
                      ) : (
                        agentMessages.map((msg, i) => (
                          <div key={i} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <span className={`inline-block px-2 py-1 rounded ${
                              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                            }`}>
                              {msg.content}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-800">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInputs({ ...inputs, [agentId]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage(agentId)}
                          placeholder="Message..."
                          className="flex-1 px-2 py-1 bg-gray-800 rounded text-white text-sm border border-gray-700"
                        />
                        <button onClick={() => sendMessage(agentId)} className="px-2 py-1 bg-blue-600 text-white rounded">
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Team Chat Modal */}
      {showTeamChat && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-3xl h-[70vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Team Chat</h3>
                <span className="text-xs text-gray-500">All agents</span>
              </div>
              <button onClick={() => setShowTeamChat(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {teamMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-16">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Send a message to all agents</p>
                </div>
              ) : (
                teamMessages.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-xl">
                      {AGENTS.find(a => a.id === msg.agentId)?.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">{msg.agentName}</span>
                        <span className="text-xs text-gray-500">{msg.time.toLocaleTimeString()}</span>
                      </div>
                      <div className="bg-gray-800 rounded p-2 text-gray-300 text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTeamMessage()}
                  placeholder="Message all agents..."
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700"
                />
                <button onClick={sendTeamMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Digital Office</h2>
          <p className="text-gray-400">Real-time agent workspace with live system metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTeamChat(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Users className="w-4 h-4" />
            Team Chat
          </button>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">{workingCount} Working</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-400">{idleCount} Idle</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">{activeCount} Spawned</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Resources */}
      {resources && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">CPU</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{resources.cpu.usagePercent}%</span>
              <span className="text-xs text-gray-500 mb-1">{resources.cpu.count} cores</span>
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${resources.cpu.usagePercent}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Memory</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{resources.memory.usagePercent}%</span>
              <span className="text-xs text-gray-500 mb-1">
                {Math.floor(resources.memory.used / 1024)}GB / {Math.floor(resources.memory.total / 1024)}GB
              </span>
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${resources.memory.usagePercent}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.floor(resources.uptime / 3600)}h {Math.floor((resources.uptime % 3600) / 60)}m
            </p>
            <p className="text-xs text-gray-500 mt-1">System uptime</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-500">WebSocket</span>
            </div>
            <p className={`text-2xl font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {onlineAgents.size} agents online
            </p>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const status = STATUS_CONFIG[agent.status];
          const tier = TIER_CONFIG[agent.tier];
          const StatusIcon = status.icon;
          const isOnline = onlineAgents.has(agent.id);

          return (
            <div
              key={agent.id}
              className={`bg-gray-900 rounded-xl p-5 border ${tier.border} hover:border-gray-600 transition-all`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl relative`}>
                    {agent.avatar}
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${tier.labelColor}`}>
                        {tier.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{agent.model}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon className={`w-4 h-4 ${status.color.replace('bg-', 'text-')}`} />
                <span className={`text-sm ${status.color.replace('bg-', 'text-')}`}>
                  {status.label}
                </span>
                {isOnline && (
                  <span className="text-xs text-green-400 ml-2">• Live</span>
                )}
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                  <p className="text-xs text-gray-400 mb-1">Current Task:</p>
                  <p className="text-sm text-gray-300">{agent.currentTask}</p>
                </div>
              )}

              {/* Task List */}
              <div className="space-y-1 mb-3">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Tasks ({agent.tasks.filter(t => t.status === 'done').length}/{agent.tasks.length})
                </p>
                {agent.tasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-600'
                    }`}></div>
                    <span className={task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-400'}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-800">
                <button 
                  onClick={() => openChat(agent.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    chatWindows.includes(agent.id)
                      ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {chatWindows.includes(agent.id) ? 'Chat Open' : 'Chat'}
                </button>
                {agent.tier === 'subagent' && (
                  <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">
                    <Bot className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-white">
            {AGENTS.reduce((acc, a) => acc + a.tasks.length, 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {AGENTS.reduce((acc, a) => acc + a.tasks.filter(t => t.status === 'done').length, 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">
            {AGENTS.reduce((acc, a) => acc + a.tasks.filter(t => t.status === 'in-progress').length, 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Active Chats</p>
          <p className="text-2xl font-bold text-purple-400">{chatWindows.length}</p>
        </div>
      </div>
    </div>
  );
}
