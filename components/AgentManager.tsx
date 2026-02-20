import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  FileText, 
  Brain, 
  Wrench,
  Plus,
  Edit3,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  Cpu,
  Sparkles,
  Send,
  ExternalLink,
  Maximize2,
  MessageCircle,
  Users
} from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  icon: string;
  role: string;
  status: 'online' | 'busy' | 'idle' | 'offline';
  currentModel: string;
  description: string;
  config: {
    soul: string;
    skills: string[];
    memory: string;
    tools: string;
    identity: string;
  };
  stats: {
    tasksCompleted: number;
    sessionsToday: number;
    messagesSent: number;
    lastActive: string;
  };
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'oneclaw',
    name: 'OneClaw',
    icon: '☁️',
    role: 'PRIMARY AGENT - Main OpenClaw Instance',
    status: 'online',
    currentModel: 'moonshot/kimi-k2.5',
    description: 'The main OpenClaw agent. Spawns and orchestrates sub-agents (Architect, Builder, Money Maker, Operator). Primary interface for all operations.',
    config: {
      soul: '/Users/oneclaw/.openclaw/workspace/SOUL.md',
      skills: ['web_search', 'web_fetch', 'file_operations', 'shell_commands', 'browser_automation', 'spawn_agents', 'steer_subagents'],
      memory: '/Users/oneclaw/.openclaw/workspace/MEMORY.md',
      tools: '/Users/oneclaw/.openclaw/workspace/TOOLS.md',
      identity: '/Users/oneclaw/.openclaw/workspace/IDENTITY.md',
    },
    stats: {
      tasksCompleted: 247,
      sessionsToday: 8,
      messagesSent: 1847,
      lastActive: 'Just now',
    },
  },
  {
    id: 'bossclaw',
    name: 'BossClaw',
    icon: '🖥️',
    role: 'SECONDARY AGENT - Local Mac Studio Instance',
    status: 'online',
    currentModel: 'minimax/minimax-m2.5',
    description: 'Separate OpenClaw instance running locally on Mac Studio. Independent from OneClaw with direct access to local resources, Voice AI, and MiniMax M2.5.',
    config: {
      soul: '/Users/oneclaw/.openclaw/agents/bossclaw/SOUL.md',
      skills: ['voice_generation', 'local_compute', 'file_operations', 'shell_commands', 'mac_studio_access'],
      memory: '/Users/oneclaw/.openclaw/agents/bossclaw/MEMORY.md',
      tools: '/Users/oneclaw/.openclaw/agents/bossclaw/TOOLS.md',
      identity: '/Users/oneclaw/.openclaw/agents/bossclaw/IDENTITY.md',
    },
    stats: {
      tasksCompleted: 89,
      sessionsToday: 3,
      messagesSent: 423,
      lastActive: '5 min ago',
    },
  },
  {
    id: 'architect',
    name: 'Architect',
    icon: '🏗️',
    role: 'SUB-AGENT - Spawned by OneClaw',
    status: 'idle',
    currentModel: 'anthropic/claude-opus-4-6',
    description: 'Sub-agent spawned by OneClaw for system design, strategic planning, and technical architecture tasks. Runs in isolated sessions.',
    config: {
      soul: '/Users/oneclaw/.openclaw/agents/architect/SOUL.md',
      skills: ['system_design', 'technical_planning', 'architecture_review'],
      memory: '/Users/oneclaw/.openclaw/agents/architect/MEMORY.md',
      tools: '/Users/oneclaw/.openclaw/agents/architect/TOOLS.md',
      identity: '/Users/oneclaw/.openclaw/agents/architect/IDENTITY.md',
    },
    stats: {
      tasksCompleted: 34,
      sessionsToday: 1,
      messagesSent: 156,
      lastActive: '2 hours ago',
    },
  },
  {
    id: 'builder',
    name: 'Builder',
    icon: '🔨',
    role: 'SUB-AGENT - Spawned by OneClaw',
    status: 'busy',
    currentModel: 'moonshot/kimi-k2.5',
    description: 'Sub-agent spawned by OneClaw for coding, MVP development, and product implementation. Runs in isolated sessions.',
    config: {
      soul: '/Users/oneclaw/.openclaw/agents/builder/SOUL.md',
      skills: ['coding', 'mvp_development', 'technical_implementation'],
      memory: '/Users/oneclaw/.openclaw/agents/builder/MEMORY.md',
      tools: '/Users/oneclaw/.openclaw/agents/builder/TOOLS.md',
      identity: '/Users/oneclaw/.openclaw/agents/builder/IDENTITY.md',
    },
    stats: {
      tasksCompleted: 67,
      sessionsToday: 4,
      messagesSent: 312,
      lastActive: 'Just now',
    },
  },
  {
    id: 'money-maker',
    name: 'Money Maker',
    icon: '💰',
    role: 'SUB-AGENT - Spawned by OneClaw',
    status: 'idle',
    currentModel: 'anthropic/claude-sonnet-4-6',
    description: 'Sub-agent spawned by OneClaw for business development, fundraising, and revenue optimization tasks. Runs in isolated sessions.',
    config: {
      soul: '/Users/oneclaw/.openclaw/agents/money-maker/SOUL.md',
      skills: ['business_development', 'fundraising', 'revenue_optimization'],
      memory: '/Users/oneclaw/.openclaw/agents/money-maker/MEMORY.md',
      tools: '/Users/oneclaw/.openclaw/agents/money-maker/TOOLS.md',
      identity: '/Users/oneclaw/.openclaw/agents/money-maker/IDENTITY.md',
    },
    stats: {
      tasksCompleted: 23,
      sessionsToday: 0,
      messagesSent: 89,
      lastActive: '1 day ago',
    },
  },
  {
    id: 'operator',
    name: 'Operator',
    icon: '⚙️',
    role: 'SUB-AGENT - Spawned by OneClaw',
    status: 'idle',
    currentModel: 'moonshot/kimi-k2.5',
    description: 'Sub-agent spawned by OneClaw for operations, automation, and system maintenance tasks. Runs in isolated sessions.',
    config: {
      soul: '/Users/oneclaw/.openclaw/agents/operator/SOUL.md',
      skills: ['automation', 'system_maintenance', 'operations'],
      memory: '/Users/oneclaw/.openclaw/agents/operator/MEMORY.md',
      tools: '/Users/oneclaw/.openclaw/agents/operator/TOOLS.md',
      identity: '/Users/oneclaw/.openclaw/agents/operator/IDENTITY.md',
    },
    stats: {
      tasksCompleted: 45,
      sessionsToday: 1,
      messagesSent: 178,
      lastActive: '3 hours ago',
    },
  },
];

const AVAILABLE_MODELS = [
  { id: 'moonshot/kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot' },
  { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic' },
  { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gemini/gemini-2-flash', name: 'Gemini Flash', provider: 'Google' },
  { id: 'minimax/minimax-m2.5', name: 'MiniMax M2.5', provider: 'MiniMax (Local)', badge: 'WORKHORSE' },
];

const ALL_SKILLS = [
  { id: 'web_search', name: 'Web Search', description: 'Search the web using Brave API', category: 'Research' },
  { id: 'web_fetch', name: 'Web Fetch', description: 'Fetch and extract content from URLs', category: 'Research' },
  { id: 'file_operations', name: 'File Operations', description: 'Read, write, edit files', category: 'System' },
  { id: 'shell_commands', name: 'Shell Commands', description: 'Execute shell commands', category: 'System' },
  { id: 'browser_automation', name: 'Browser Automation', description: 'Control browser via OpenClaw', category: 'Automation' },
  { id: 'voice_generation', name: 'Voice Generation', description: 'Generate voice using ElevenLabs/Voicebox', category: 'AI' },
  { id: 'coding', name: 'Coding', description: 'Software development and coding tasks', category: 'Development' },
  { id: 'mvp_development', name: 'MVP Development', description: 'Build minimum viable products', category: 'Development' },
  { id: 'system_design', name: 'System Design', description: 'Architectural planning and design', category: 'Architecture' },
  { id: 'technical_planning', name: 'Technical Planning', description: 'Technical strategy and roadmaps', category: 'Architecture' },
  { id: 'business_development', name: 'Business Development', description: 'Business strategy and growth', category: 'Business' },
  { id: 'fundraising', name: 'Fundraising', description: 'Investor relations and fundraising', category: 'Business' },
  { id: 'automation', name: 'Automation', description: 'Automate repetitive tasks', category: 'Operations' },
  { id: 'system_maintenance', name: 'System Maintenance', description: 'Maintain and monitor systems', category: 'Operations' },
  { id: 'architecture_review', name: 'Architecture Review', description: 'Review and critique architecture', category: 'Architecture' },
  { id: 'revenue_optimization', name: 'Revenue Optimization', description: 'Optimize business revenue streams', category: 'Business' },
  { id: 'technical_implementation', name: 'Technical Implementation', description: 'Implement technical solutions', category: 'Development' },
];

export default function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'chat' | 'skills'>('overview');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'agent'; content: string; timestamp: Date}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [openChatWindows, setOpenChatWindows] = useState<string[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windowMessages, setWindowMessages] = useState<Record<string, {role: 'user' | 'agent'; content: string; timestamp: Date}[]>>({});
  const [windowInputs, setWindowInputs] = useState<Record<string, string>>({});
  const [showMultiAgentChat, setShowMultiAgentChat] = useState(false);
  const [multiAgentInput, setMultiAgentInput] = useState('');
  const [multiAgentMessages, setMultiAgentMessages] = useState<{agentId: string; agentName: string; agentIcon: string; content: string; timestamp: Date}[]>([]);

  const updateAgentModel = (agentId: string, modelId: string) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, currentModel: modelId } : a));
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    setEditingAgent(null);
    if (selectedAgent?.id === updatedAgent.id) {
      setSelectedAgent(updatedAgent);
    }
  };

  const toggleSkill = (agentId: string, skillId: string) => {
    setAgents(agents.map(a => {
      if (a.id !== agentId) return a;
      const newSkills = a.config.skills.includes(skillId)
        ? a.config.skills.filter(s => s !== skillId)
        : [...a.config.skills, skillId];
      return { ...a, config: { ...a.config, skills: newSkills } };
    }));
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedAgent) return;
    
    const userMessage = { role: 'user' as const, content: chatInput, timestamp: new Date() };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    
    setTimeout(() => {
      const agentMessage = { 
        role: 'agent' as const, 
        content: `[${selectedAgent.name} using ${selectedAgent.currentModel}]\n\nI'm processing your request. In a real implementation, this would send to the OpenClaw API with the selected model and agent context.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const openChatWindow = (agentId: string) => {
    if (!openChatWindows.includes(agentId)) {
      setOpenChatWindows([...openChatWindows, agentId]);
    }
    setActiveWindowId(agentId);
  };

  const closeChatWindow = (agentId: string) => {
    setOpenChatWindows(openChatWindows.filter(id => id !== agentId));
    if (activeWindowId === agentId) {
      setActiveWindowId(null);
    }
  };

  const sendWindowMessage = (agentId: string) => {
    const input = windowInputs[agentId] || '';
    if (!input.trim()) return;
    
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const userMessage = { role: 'user' as const, content: input, timestamp: new Date() };
    setWindowMessages(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMessage]
    }));
    setWindowInputs({ ...windowInputs, [agentId]: '' });
    
    setTimeout(() => {
      const agentMessage = { 
        role: 'agent' as const, 
        content: `[${agent.name} via ${agent.currentModel}]\n\nProcessing your request...`,
        timestamp: new Date()
      };
      setWindowMessages(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), agentMessage]
      }));
    }, 1000);
  };

  const sendMultiAgentMessage = () => {
    if (!multiAgentInput.trim()) return;
    
    const timestamp = new Date();
    
    agents.filter(a => a.status !== 'offline').forEach((agent, index) => {
      setTimeout(() => {
        setMultiAgentMessages(prev => [...prev, {
          agentId: agent.id,
          agentName: agent.name,
          agentIcon: agent.icon,
          content: `[${agent.name}]\n\n${multiAgentInput}\n\nProcessing with ${agent.currentModel}...`,
          timestamp: new Date()
        }]);
      }, index * 500);
    });
    
    setMultiAgentInput('');
  };

  const getSpawnButton = () => {
    const tier = getAgentTier(selectedAgent!);
    if (tier.label === 'SUB-AGENT') {
      return (
        <button
          onClick={() => alert(`Spawn ${selectedAgent!.name} sub-agent via OneClaw`)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          <Sparkles className="w-4 h-4" />
          Spawn
        </button>
      );
    }
    return null;
  };

  if (selectedAgent) {
    const tier = getAgentTier(selectedAgent);
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div className="text-4xl">{selectedAgent.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${tier.color}`}>{tier.label}</span>
              </div>
              <p className="text-gray-400">{selectedAgent.role}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              selectedAgent.status === 'online' ? 'bg-green-500/20 text-green-400' :
              selectedAgent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
              selectedAgent.status === 'idle' ? 'bg-gray-500/20 text-gray-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {selectedAgent.status}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getSpawnButton()}
            <select
              value={selectedAgent.currentModel}
              onChange={(e) => updateAgentModel(selectedAgent.id, e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            <button
              onClick={() => setEditingAgent(selectedAgent)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {(['overview', 'skills', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <AgentOverview agent={selectedAgent} />}

        {activeTab === 'skills' && (
          <AgentSkills 
            agent={selectedAgent}
            allSkills={ALL_SKILLS}
            onToggleSkill={toggleSkill}
          />
        )}

        {activeTab === 'chat' && (
          <AgentChat 
            agent={selectedAgent}
            messages={chatMessages}
            input={chatInput}
            onInputChange={setChatInput}
            onSend={sendMessage}
          />
        )}

        {editingAgent && (
          <EditAgentModal
            agent={editingAgent}
            onSave={updateAgent}
            onCancel={() => setEditingAgent(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Chat Windows Overlay */}
      {openChatWindows.length > 0 && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-40">
          {openChatWindows.map(agentId => {
            const agent = agents.find(a => a.id === agentId);
            if (!agent) return null;
            const isActive = activeWindowId === agentId;
            const messages = windowMessages[agentId] || [];
            const input = windowInputs[agentId] || '';
            
            return (
              <div 
                key={agentId}
                className={`bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all ${
                  isActive ? 'w-96 h-[500px]' : 'w-64 h-12'
                }`}
              >
                {/* Window Header */}
                <div 
                  className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-t-xl cursor-pointer"
                  onClick={() => setActiveWindowId(isActive ? null : agentId)}
                >
                  <div className="flex items-center gap-2">
                    <span>{agent.icon}</span>
                    <span className="text-sm font-medium text-white">{agent.name}</span>
                    <span className="text-xs text-gray-500">{agent.currentModel.split('/').pop()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveWindowId(isActive ? null : agentId); }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      {isActive ? '−' : '+'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeChatWindow(agentId); }}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Chat Content */}
                {isActive && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm mt-8">
                          Start chatting with {agent.name}
                        </p>
                      ) : (
                        messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-800">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setWindowInputs({ ...windowInputs, [agentId]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && sendWindowMessage(agentId)}
                          placeholder="Type message..."
                          className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <button 
                          onClick={() => sendWindowMessage(agentId)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          <Send className="w-4 h-4" />
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

      {/* Multi-Agent Chat Modal */}
      {showMultiAgentChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col border border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Multi-Agent Chat</h3>
                <span className="text-sm text-gray-500">Prompt all active agents at once</span>
              </div>
              <button 
                onClick={() => setShowMultiAgentChat(false)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {multiAgentMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Send a message to all active agents</p>
                  <p className="text-sm mt-2">They will respond based on their individual models and configurations</p>
                </div>
              ) : (
                multiAgentMessages.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-2xl">{msg.agentIcon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{msg.agentName}</span>
                        <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-gray-300 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={multiAgentInput}
                  onChange={(e) => setMultiAgentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMultiAgentMessage()}
                  placeholder="Send message to all agents..."
                  className="flex-1 px-4 py-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <button 
                  onClick={sendMultiAgentMessage}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send to All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Manager</h2>
          <p className="text-gray-400">Configure and manage all agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMultiAgentChat(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            <Users className="w-4 h-4" />
            Multi-Agent Chat
          </button>
          <button
            onClick={() => setEditingAgent({
              id: `new-${Date.now()}`,
              name: 'New Agent',
              icon: '🤖',
              role: 'Specialist',
              status: 'offline',
              currentModel: 'moonshot/kimi-k2.5',
              description: '',
              config: { soul: '', skills: [], memory: '', tools: '', identity: '' },
              stats: { tasksCompleted: 0, sessionsToday: 0, messagesSent: 0, lastActive: 'Never' },
            })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            onClick={() => setSelectedAgent(agent)}
            onModelChange={(modelId) => updateAgentModel(agent.id, modelId)}
            onOpenChat={() => openChatWindow(agent.id)}
            isChatOpen={openChatWindows.includes(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}

function getAgentTier(agent: Agent): { label: string; color: string } {
  if (agent.id === 'oneclaw') return { label: 'PRIMARY', color: 'bg-blue-600' };
  if (agent.id === 'bossclaw') return { label: 'SECONDARY', color: 'bg-purple-600' };
  return { label: 'SUB-AGENT', color: 'bg-gray-600' };
}

function AgentCard({ agent, onClick, onModelChange, onOpenChat, isChatOpen }: { agent: Agent; onClick: () => void; onModelChange: (m: string) => void; onOpenChat: () => void; isChatOpen: boolean }) {
  const statusColors = { online: 'bg-green-500', busy: 'bg-yellow-500', idle: 'bg-gray-500', offline: 'bg-red-500' };
  const currentModel = AVAILABLE_MODELS.find(m => m.id === agent.currentModel);
  const tier = getAgentTier(agent);

  return (
    <div className={`bg-gray-900 rounded-xl p-6 border transition-all ${agent.id === 'oneclaw' ? 'border-blue-600/50 ring-1 ring-blue-600/20' : 'border-gray-800 hover:border-gray-700'}`}>
      <div onClick={onClick} className="cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${tier.color}`}>{tier.label}</span>
              </div>
              <p className="text-sm text-gray-500">{agent.role}</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`} />
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Model</span>
            <span className="text-xs text-gray-300">{currentModel?.name || agent.currentModel}</span>
          </div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Tasks</span><span className="text-gray-300">{agent.stats.tasksCompleted}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Last Active</span><span className="text-gray-300">{agent.stats.lastActive}</span></div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-1">
          {agent.config.skills.slice(0, 4).map(skill => <span key={skill} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{skill}</span>)}
          {agent.config.skills.length > 4 && <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">+{agent.config.skills.length - 4}</span>}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isChatOpen 
              ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {isChatOpen ? 'Chat Open' : 'Open Chat'}
        </button>
        <select 
          value={agent.currentModel} 
          onChange={(e) => { e.stopPropagation(); onModelChange(e.target.value); }} 
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
    </div>
  );
}

function AgentOverview({ agent }: { agent: Agent }) {
  const files = [
    { label: 'SOUL.md', path: agent.config.soul },
    { label: 'MEMORY.md', path: agent.config.memory },
    { label: 'TOOLS.md', path: agent.config.tools },
    { label: 'IDENTITY.md', path: agent.config.identity },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Tasks Completed" value={agent.stats.tasksCompleted} color="blue" />
        <StatCard title="Sessions Today" value={agent.stats.sessionsToday} color="purple" />
        <StatCard title="Messages Sent" value={agent.stats.messagesSent} color="green" />
        <StatCard title="Skills" value={agent.config.skills.length} color="orange" />
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
        <p className="text-gray-400">{agent.description}</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration Files</h3>
        <div className="grid grid-cols-2 gap-3">
          {files.map((file) => (
            <div key={file.label} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{file.label}</p>
                <p className="text-xs text-gray-500 truncate">{file.path || 'Not configured'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
  };
  return (
    <div className={`p-6 rounded-xl border ${colors[color]}`}>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function AgentSkills({ agent, allSkills, onToggleSkill }: { agent: Agent; allSkills: typeof ALL_SKILLS; onToggleSkill: (a: string, s: string) => void }) {
  const categories = Array.from(new Set(allSkills.map(s => s.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Skills ({agent.config.skills.length} enabled)</h3>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allSkills.filter(s => s.category === category).map((skill) => {
              const isEnabled = agent.config.skills.includes(skill.id);
              return (
                <button key={skill.id} onClick={() => onToggleSkill(agent.id, skill.id)} className={`p-4 rounded-lg border text-left transition-all ${isEnabled ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`font-medium ${isEnabled ? 'text-blue-400' : 'text-gray-400'}`}>{skill.name}</span>
                    {isEnabled && <Sparkles className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-sm text-gray-500">{skill.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentChat({ agent, messages, input, onInputChange, onSend }: { agent: Agent; messages: any[]; input: string; onInputChange: (v: string) => void; onSend: () => void }) {
  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 bg-gray-900 rounded-t-xl border border-gray-800 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with {agent.name}</p>
            <p className="text-sm">Using {agent.currentModel}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-50 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-gray-900 border border-t-0 border-gray-800 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
            placeholder={`Message ${agent.name}...`}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={onSend} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAgentModal({ agent, onSave, onCancel }: { agent: Agent; onSave: (a: Agent) => void; onCancel: () => void }) {
  const [form, setForm] = useState(agent);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{agent.id.startsWith('new-') ? 'Create Agent' : 'Edit Agent'}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Icon</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Role</label>
            <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700" />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 h-20" />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Default Model</label>
            <select value={form.currentModel} onChange={(e) => setForm({ ...form, currentModel: e.target.value })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700">
              {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">SOUL.md Path</label>
              <input type="text" value={form.config.soul} onChange={(e) => setForm({ ...form, config: { ...form.config, soul: e.target.value } })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">MEMORY.md Path</label>
              <input type="text" value={form.config.memory} onChange={(e) => setForm({ ...form, config: { ...form.config, memory: e.target.value } })} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700" />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Save</button>
            <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
