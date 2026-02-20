/**
 * Live Model Switcher Component
 * Real model switching with live status, testing, and metrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  Zap, 
  Brain, 
  Gauge, 
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  Play,
  Server
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  status: 'available' | 'down' | 'testing';
  latency?: number;
  lastTested?: string;
  version: string;
  description: string;
  contextWindow: string;
  costPer1kTokens: string;
}

interface ModelTestResult {
  modelId: string;
  success: boolean;
  latency: number;
  testedAt: string;
  error?: string;
}

export default function ModelSwitcherLive() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [currentModel, setCurrentModel] = useState('moonshot/kimi-k2.5');
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch models on mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data.models);
    } catch (err) {
      setError('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const testAllModels = async () => {
    setTestingAll(true);
    try {
      const res = await fetch('/api/models?action=test-all');
      const data = await res.json();
      setModels(data.models);
    } catch (err) {
      setError('Failed to test models');
    } finally {
      setTestingAll(false);
    }
  };

  const testModel = async (modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'testing' } : m
    ));
    
    try {
      const res = await fetch(`/api/models?action=test&modelId=${encodeURIComponent(modelId)}`);
      const data = await res.json();
      
      setModels(prev => prev.map(m => 
        m.id === modelId ? { 
          ...m, 
          status: data.success ? 'available' : 'down',
          latency: data.latency,
          lastTested: data.testedAt
        } : m
      ));
    } catch (err) {
      setModels(prev => prev.map(m => 
        m.id === modelId ? { ...m, status: 'down' } : m
      ));
    }
  };

  const switchModel = async (modelId: string) => {
    setSwitching(modelId);
    try {
      const res = await fetch('/api/models?action=switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetModel: modelId })
      });
      
      if (res.ok) {
        setCurrentModel(modelId);
      }
    } catch (err) {
      setError('Failed to switch model');
    } finally {
      setSwitching(null);
    }
  };

  const getModelIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic': return <Brain className="w-6 h-6 text-white" />;
      case 'openai': return <Zap className="w-6 h-6 text-white" />;
      case 'moonshot ai': return <TrendingUp className="w-6 h-6 text-white" />;
      case 'minimax': return <Server className="w-6 h-6 text-white" />;
      default: return <Cpu className="w-6 h-6 text-white" />;
    }
  };

  const getModelColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic': return 'from-orange-500 to-red-500';
      case 'openai': return 'from-green-500 to-emerald-500';
      case 'moonshot ai': return 'from-purple-500 to-pink-500';
      case 'minimax': return 'from-red-600 to-orange-600';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            Model Management
          </h2>
          <p className="text-gray-400 mt-1">
            Test and switch between available AI models
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchModels}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={testAllModels}
            disabled={testingAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {testingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Test All Models
          </button>
        </div>
      </div>

      {/* Current Model */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Model</h3>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getModelColor(models.find(m => m.id === currentModel)?.provider || '')} flex items-center justify-center`}>
            {getModelIcon(models.find(m => m.id === currentModel)?.provider || '')}
          </div>
          <div>
            <p className="text-xl font-semibold text-white">
              {models.find(m => m.id === currentModel)?.name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-400">
              {models.find(m => m.id === currentModel)?.provider} • Version {models.find(m => m.id === currentModel)?.version}
            </p>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className={`relative p-6 rounded-xl border transition-all ${
              currentModel === model.id
                ? 'bg-gray-800 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}
          >
            {/* Selected Indicator */}
            {currentModel === model.id && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getModelColor(model.provider)} flex items-center justify-center flex-shrink-0`}>
                {getModelIcon(model.provider)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{model.name}</h3>
                <p className="text-sm text-gray-500">{model.provider}</p>
                
                {/* Status */}
                <div className="flex items-center gap-2 mt-2">
                  {model.status === 'testing' ? (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Testing...
                    </span>
                  ) : model.status === 'available' ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Wifi className="w-3 h-3" />
                      Online {model.latency && `(${model.latency}ms)`}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">{model.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-950 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Context</p>
                <p className="text-sm font-medium text-gray-300">{model.contextWindow}</p>
              </div>
              <div className="bg-gray-950 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Cost</p>
                <p className="text-sm font-medium text-gray-300">{model.costPer1kTokens}</p>
              </div>
            </div>

            {/* Version */}
            <div className="mb-4">
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                Version {model.version}
              </span>
              {model.lastTested && (
                <span className="ml-2 text-xs text-gray-500">
                  Tested {new Date(model.lastTested).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => testModel(model.id)}
                disabled={model.status === 'testing'}
                className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors text-sm"
              >
                {model.status === 'testing' ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Testing...
                  </span>
                ) : (
                  'Test'
                )}
              </button>
              <button
                onClick={() => switchModel(model.id)}
                disabled={switching === model.id || model.status !== 'available'}
                className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm ${
                  currentModel === model.id
                    ? 'bg-blue-600 text-white cursor-default'
                    : model.status === 'available'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {switching === model.id ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Switching...
                  </span>
                ) : currentModel === model.id ? (
                  'Active'
                ) : model.status !== 'available' ? (
                  'Unavailable'
                ) : (
                  'Switch'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-sm text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
