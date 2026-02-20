import React, { useState } from 'react';
import { Cpu, Zap, Brain, Gauge, ChevronDown, Sparkles } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: 'Very Fast' | 'Fast' | 'Medium' | 'Slow';
  quality: 'Good' | 'High' | 'Excellent' | 'Exceptional';
  cost: '$' | '$$' | '$$$' | '$$$$' | 'FREE';
  contextWindow: string;
  bestFor: string[];
  color: string;
}

const MODELS: AIModel[] = [
  {
    id: 'moonshot/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'Moonshot',
    description: 'Fast and efficient for most tasks',
    speed: 'Fast',
    quality: 'High',
    cost: '$',
    contextWindow: '128K',
    bestFor: ['General tasks', 'Quick responses', 'Code generation', 'Multi-project'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'anthropic/claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    description: 'Balanced performance and quality',
    speed: 'Medium',
    quality: 'Excellent',
    cost: '$$',
    contextWindow: '200K',
    bestFor: ['Complex reasoning', 'Analysis', 'Writing', 'Strategic planning'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'anthropic/claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    description: 'Maximum capability for critical work',
    speed: 'Slow',
    quality: 'Exceptional',
    cost: '$$$$',
    contextWindow: '200K',
    bestFor: ['Mission critical', 'Research papers', 'Complex code', 'High-stakes decisions'],
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Versatile and widely capable',
    speed: 'Fast',
    quality: 'Excellent',
    cost: '$$',
    contextWindow: '128K',
    bestFor: ['Conversations', 'Creative tasks', 'Multimodal', 'General purpose'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'gemini/gemini-2-flash',
    name: 'Gemini Flash',
    provider: 'Google',
    description: 'Ultra-fast for high-volume tasks',
    speed: 'Very Fast',
    quality: 'Good',
    cost: '$',
    contextWindow: '1M',
    bestFor: ['High volume', 'Simple queries', 'Quick summaries', 'Drafts'],
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'minimax/minimax-m2.5',
    name: 'MiniMax M2.5',
    provider: 'MiniMax (Local)',
    description: '230B MoE workhorse - Local operations station power',
    speed: 'Medium',
    quality: 'Excellent',
    cost: 'FREE',
    contextWindow: '196K',
    bestFor: ['Heavy lifting', 'Operations', 'Long context', 'Local processing', 'Workhorse tasks'],
    color: 'from-red-600 to-orange-600'
  },
];

interface ModelSwitcherProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
  compact?: boolean;
}

export default function ModelSwitcher({ currentModel, onModelChange, compact = false }: ModelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = MODELS.find(m => m.id === currentModel) || MODELS[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${selectedModel.color}`} />
          <span className="truncate max-w-[100px]">{selectedModel.name}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 rounded-xl border border-gray-700 shadow-2xl z-50 py-2">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase font-medium">Select Model</div>
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => { onModelChange(model.id); setIsOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-3 ${
                    currentModel === model.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${model.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 truncate">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.provider}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Models</h2>
          <p className="text-gray-400">Choose the right intelligence for each task</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MODELS.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={currentModel === model.id}
            onSelect={() => onModelChange(model.id)}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Model Selection Tips</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
            <span>Use <strong>Gemini Flash</strong> or <strong>Kimi K2.5</strong> for quick tasks and high-volume work</span>
          </li>
          <li className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-blue-500 mt-0.5" />
            <span>Use <strong>Claude Sonnet 4</strong> or <strong>GPT-4o</strong> for balanced everyday work</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
            <span>Use <strong>Claude 4.6</strong> or <strong>Claude Opus</strong> for critical, complex decisions</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function ModelCard({ model, isSelected, onSelect }: { model: AIModel; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`text-left p-6 rounded-xl border transition-all ${
        isSelected 
          ? 'bg-gray-800 border-blue-500 ring-2 ring-blue-500/20' 
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center`}>
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{model.name}</h3>
            <p className="text-sm text-gray-500">{model.provider}</p>
          </div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4">{model.description}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-950 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
            <Zap className="w-3 h-3" />
          </div>
          <p className="text-xs text-gray-300">{model.speed}</p>
        </div>
        <div className="bg-gray-950 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
            <Brain className="w-3 h-3" />
          </div>
          <p className="text-xs text-gray-300">{model.quality}</p>
        </div>
        <div className="bg-gray-950 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
            <Gauge className="w-3 h-3" />
          </div>
          <p className="text-xs text-gray-300">{model.contextWindow}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {model.bestFor.slice(0, 3).map((use) => (
          <span key={use} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
            {use}
          </span>
        ))}
      </div>
    </button>
  );
}
