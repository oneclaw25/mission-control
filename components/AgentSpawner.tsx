import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Square, 
  Terminal, 
  Cpu, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAgents, SpawnedAgent, AgentMetrics } from '../lib/useAgents';

const AGENT_TYPES = [
  { id: 'architect', name: 'Architect', icon: '🏗️', description: 'System design & architecture', color: 'blue' },
  { id: 'builder', name: 'Builder', icon: '🔨', description: 'Coding & implementation', color: 'green' },
  { id: 'money-maker', name: 'Money Maker', icon: '💰', description: 'Business & fundraising', color: 'yellow' },
  { id: 'operator', name: 'Operator', icon: '⚙️', description: 'Operations & automation', color: 'gray' },
];

const AVAILABLE_MODELS = [
  { id: 'moonshot/kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot' },
  { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic' },
  { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
];

const STATUS_CONFIG = {
  spawning: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: Loader2, label: 'Spawning' },
  running: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: Loader2, label: 'Running' },
  completed: { color: 'text-green-400', bgColor: 'bg-green-500/10', icon: CheckCircle, label: 'Completed' },
  error: { color: 'text-red-400', bgColor: 'bg-red-500/10', icon: XCircle, label: 'Error' },
};

export default function AgentSpawner() {
  const { 
    agents, 
    isLoading, 
    error, 
    spawnAgent, 
    killAgent, 
    getMetrics, 
    getLogs,
    refresh,
    activeCount 
  } = useAgents();
  
  const [selectedType, setSelectedType] = useState(AGENT_TYPES[0].id);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [taskDescription, setTaskDescription] = useState('');
  const [isSpawning, setIsSpawning] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<Record<string, AgentMetrics>>({});
  const [agentLogs, setAgentLogs] = useState<Record<string, string[]>>({});

  const handleSpawn = async () => {
    if (!taskDescription.trim()) return;
    
    setIsSpawning(true);
    await spawnAgent({
      type: selectedType,
      model: selectedModel,
      task: taskDescription,
      timeout: 3600,
    });
    setIsSpawning(false);
    setTaskDescription('');
  };

  const handleKill = async (agentId: string) => {
    await killAgent(agentId);
  };

  const toggleExpand = async (agentId: string) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(agentId);
      // Load metrics and logs
      const metrics = await getMetrics(agentId);
      const logs = await getLogs(agentId);
      if (metrics) {
        setAgentMetrics(prev => ({ ...prev, [agentId]: metrics }));
      }
      setAgentLogs(prev => ({ ...prev, [agentId]: logs }));
    }
  };

  const selectedTypeInfo = AGENT_TYPES.find(t => t.id === selectedType);
  const statusCounts = {
    spawning: agents.filter(a => a.status === 'spawning').length,
    running: agents.filter(a => a.status === 'running').length,
    completed: agents.filter(a => a.status === 'completed').length,
    error: agents.filter(a => a.status === 'error').length,
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Spawner</h2>
          <p className="text-gray-400">
            {agents.length} spawned • {activeCount} active
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          return (
            <div key={status} className={`p-4 rounded-xl ${config.bgColor} border border-gray-800`}>
              <div className="flex items-center gap-2 mb-1">
                <config.icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm ${config.color}`}>{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Spawn Form */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Spawn New Agent</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Agent Type */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Agent Type</label>
            <div className="grid grid-cols-2 gap-2">
              {AGENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{type.name}</p>
                    <p className="text-xs opacity-70">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Model Selection */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            
            <div className="mt-4">
              <label className="text-sm text-gray-400 block mb-2">Selected Agent</label>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <span className="text-2xl">{selectedTypeInfo?.icon}</span>
                <div>
                  <p className="text-white font-medium">{selectedTypeInfo?.name}</p>
                  <p className="text-sm text-gray-500">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Description */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">Task Description</label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Describe what you want this agent to do..."
          />
        </div>
        
        {/* Spawn Button */}
        <button
          onClick={handleSpawn}
          disabled={!taskDescription.trim() || isSpawning}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
        >
          {isSpawning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Spawning Agent...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Spawn {selectedTypeInfo?.name} Agent
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Agents List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Spawned Agents</h3>
        
        {agents.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No agents spawned yet</p>
            <p className="text-sm text-gray-600 mt-2">Create your first agent above</p>
          </div>
        ) : (
          agents.map((agent) => {
            const status = STATUS_CONFIG[agent.status];
            const isExpanded = expandedAgent === agent.agentId;
            const metrics = agentMetrics[agent.agentId];
            const logs = agentLogs[agent.agentId] || [];
            const typeInfo = AGENT_TYPES.find(t => t.id === agent.type) || AGENT_TYPES[0];
            
            return (
              <div 
                key={agent.agentId}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                {/* Agent Header */}
                <div 
                  onClick={() => toggleExpand(agent.agentId)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{agent.agentId}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {agent.model.split('/').pop()} • Started {new Date(agent.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Quick Actions */}
                    {agent.status === 'running' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleKill(agent.agentId); }}
                        className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                        title="Kill Agent"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Expand/Collapse */}
                    <button className="p-2 text-gray-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Task Preview */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-400 line-clamp-2">{agent.task}</p>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-800">
                    {/* Metrics */}
                    {metrics && (
                      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Uptime</p>
                          <p className="text-sm text-white">{Math.floor(metrics.uptime / 60)}m {metrics.uptime % 60}s</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">CPU</p>
                          <p className="text-sm text-white">{metrics.cpu.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Memory</p>
                          <p className="text-sm text-white">{metrics.memory.toFixed(0)} MB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tokens</p>
                          <p className="text-sm text-white">{metrics.tokensProcessed}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Result */}
                    {agent.result && (
                      <div className="p-4 border-b border-gray-800">
                        <h5 className="text-sm font-medium text-gray-400 mb-2">Result</h5>
                        <div className="bg-gray-950 rounded-lg p-4">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap">{agent.result}</pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Logs */}
                    {logs.length > 0 && (
                      <div className="p-4">
                        <h5 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Logs
                        </h5>
                        <div className="bg-gray-950 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs">
                          {logs.map((log, i) => (
                            <div key={i} className="text-gray-400 py-0.5">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Session Info */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Session: {agent.sessionId}</span>
                        {agent.endTime && (
                          <span>Ended: {new Date(agent.endTime).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
