import React from 'react';
import { User, Bot, Briefcase, Code, TrendingUp, Settings } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'online' | 'busy' | 'idle';
  type: 'core' | 'sub';
  icon: React.ElementType;
  responsibilities: string[];
  spawned?: number;
}

const AGENTS: Agent[] = [
  {
    id: 'oneclaw',
    name: 'OneClaw',
    role: 'Main Assistant',
    description: 'Cloud-based agent on Mac Mini. Handles complex research, web search, document processing, and coordination.',
    status: 'online',
    type: 'core',
    icon: Bot,
    responsibilities: [
      'Web search and research',
      'Document processing',
      'External API integration',
      'Complex analysis',
      'Multi-agent coordination',
    ],
  },
  {
    id: 'bossclaw',
    name: 'BossClaw',
    role: 'Local Assistant',
    description: 'Local MiniMax agent on Mac Studio. Handles fast, private, offline tasks. Voice AI processing.',
    status: 'online',
    type: 'core',
    icon: Bot,
    responsibilities: [
      'Local LLM inference',
      'Voice AI processing',
      'Private tasks (no cloud)',
      'Fast responses',
      'Offline work',
    ],
  },
  {
    id: 'architect',
    name: 'The Architect',
    role: 'CEO Function',
    description: 'Strategic decision maker. Handles capital allocation, market expansion, risk assessment.',
    status: 'idle',
    type: 'core',
    icon: Briefcase,
    responsibilities: [
      'Strategic positioning',
      'Resource allocation',
      'Market expansion decisions',
      'Risk assessment',
      'Long-term vision',
    ],
    spawned: 0,
  },
  {
    id: 'builder',
    name: 'The Builder',
    role: 'CTO Function',
    description: 'Product and engineering lead. Handles technical architecture, quality standards, shipping.',
    status: 'busy',
    type: 'core',
    icon: Code,
    responsibilities: [
      'Product architecture',
      'Engineering decisions',
      'Code quality',
      'Technical debt management',
      'System reliability',
    ],
    spawned: 0,
  },
  {
    id: 'money-maker',
    name: 'The Money Maker',
    role: 'Growth Lead',
    description: 'Revenue and growth strategist. Handles pricing, channels, customer acquisition.',
    status: 'idle',
    type: 'core',
    icon: TrendingUp,
    responsibilities: [
      'Growth strategy',
      'Pricing decisions',
      'Channel optimization',
      'Customer acquisition',
      'Revenue forecasting',
    ],
    spawned: 0,
  },
  {
    id: 'operator',
    name: 'The Operator',
    role: 'COO Function',
    description: 'Systems and processes expert. Handles operations, tools, financial ops, compliance.',
    status: 'idle',
    type: 'core',
    icon: Settings,
    responsibilities: [
      'Process design',
      'Tool stack management',
      'Financial operations',
      'Compliance',
      'Customer support ops',
    ],
    spawned: 0,
  },
];

const SPECIALISTS = [
  { name: 'Market Researcher', parent: 'Architect' },
  { name: 'Frontend Developer', parent: 'Builder' },
  { name: 'Backend Developer', parent: 'Builder' },
  { name: 'DevOps Engineer', parent: 'Builder' },
  { name: 'Sales Rep', parent: 'Money Maker' },
  { name: 'Content Marketer', parent: 'Money Maker' },
  { name: 'Bookkeeper', parent: 'Operator' },
  { name: 'Support Specialist', parent: 'Operator' },
];

export default function TeamView() {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Structure</h2>
          <p className="text-gray-400">4-core agents + specialist library</p>
        </div>
      </div>

      {/* Core Agents Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {AGENTS.filter(a => a.type === 'core').map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* User */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Big Destiny / Duncan</h3>
            <p className="text-white/80">Commander in Chief</p>
            <p className="text-sm text-white/60 mt-1">
              Sets priorities, makes final decisions, owns the vision
            </p>
          </div>
        </div>
      </div>

      {/* Specialist Library */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Specialist Library (Spawned on Demand)</h3>
        <div className="grid grid-cols-4 gap-3">
          {SPECIALISTS.map((specialist) => (
            <div
              key={specialist.name}
              className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg"
            >
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-300">{specialist.name}</p>
                <p className="text-xs text-gray-500">→ {specialist.parent}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Core agents spawn specialists as needed. Values inherit, identity does not.
        </p>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    idle: 'bg-gray-500',
  };

  const Icon = agent.icon;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-800 rounded-lg">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-gray-500">{agent.role}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`}></div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {agent.description}
      </p>

      <div className="space-y-1">
        {agent.responsibilities.slice(0, 3).map((resp, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-500">{resp}</span>
          </div>
        ))}
        {agent.responsibilities.length > 3 && (
          <p className="text-xs text-gray-600 pl-3">
            +{agent.responsibilities.length - 3} more
          </p>
        )}
      </div>

      {agent.spawned !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Spawned: <span className="text-gray-300">{agent.spawned} specialists</span>
          </p>
        </div>
      )}
    </div>
  );
}
