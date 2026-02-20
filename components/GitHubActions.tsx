import React, { useState } from 'react';
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  GitBranch,
  Github,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Settings,
} from 'lucide-react';
import { useGitHubWorkflows } from '../hooks/useGitHub';
import { Workflow, WorkflowRun } from '../lib/github';

interface GitHubActionsProps {
  owner?: string;
  repo?: string;
}

export default function GitHubActions({ owner: propOwner, repo: propRepo }: GitHubActionsProps) {
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string }>({
    owner: propOwner || '',
    repo: propRepo || '',
  });
  
  const { workflows, runs, loading, error, refresh, triggerWorkflow } = useGitHubWorkflows(
    selectedRepo.owner,
    selectedRepo.repo
  );

  const [expandedRun, setExpandedRun] = useState<number | null>(null);
  const [triggering, setTriggering] = useState<number | null>(null);

  const handleTrigger = async (workflowId: number) => {
    setTriggering(workflowId);
    try {
      await triggerWorkflow(workflowId);
    } finally {
      setTriggering(null);
    }
  };

  const getStatusIcon = (status: string, conclusion?: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return <CheckCircle className="w-5 h-5 text-green-400" />;
      if (conclusion === 'failure') return <XCircle className="w-5 h-5 text-red-400" />;
      if (conclusion === 'cancelled') return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
    if (status === 'in_progress') return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    if (status === 'queued') return <Clock className="w-5 h-5 text-yellow-400" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (status: string, conclusion?: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'bg-green-500/10 text-green-400 border-green-500/30';
      if (conclusion === 'failure') return 'bg-red-500/10 text-red-400 border-red-500/30';
      if (conclusion === 'cancelled') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
    if (status === 'in_progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (status === 'queued') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  // If no owner/repo provided, show placeholder
  if (!selectedRepo.owner || !selectedRepo.repo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Github className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">GitHub Actions</h3>
          <p className="text-gray-500 max-w-md">
            Select a repository from the Projects tab to view and manage GitHub Actions workflows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Github className="w-6 h-6 text-gray-400" />
            GitHub Actions
          </h2>
          <p className="text-gray-400">
            {selectedRepo.owner}/{selectedRepo.repo}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://github.com/${selectedRepo.owner}/${selectedRepo.repo}/actions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Workflows */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Workflows</h3>
        {workflows.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
            <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No workflows found in this repository</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{workflow.name}</h4>
                    <p className="text-sm text-gray-500">{workflow.path}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Updated {new Date(workflow.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTrigger(workflow.id)}
                  disabled={triggering === workflow.id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {triggering === workflow.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Runs */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Runs</h3>
        {runs.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No workflow runs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.slice(0, 10).map((run) => (
              <div
                key={run.id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(run.status, run.conclusion)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{run.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(run.status, run.conclusion)}`}>
                          {run.status === 'completed' ? run.conclusion : run.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {run.head_branch}
                        </span>
                        <span>•</span>
                        <span>Run #{run.run_number}</span>
                        <span>•</span>
                        <span>{new Date(run.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={run.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {expandedRun === run.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedRun === run.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Commit SHA:</span>
                        <code className="ml-2 text-gray-300 font-mono">
                          {run.head_sha?.slice(0, 7)}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-500">Workflow ID:</span>
                        <span className="ml-2 text-gray-300">{run.workflow_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Started:</span>
                        <span className="ml-2 text-gray-300">
                          {new Date(run.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="ml-2 text-gray-300">
                          {new Date(run.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={run.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      >
                        <Terminal className="w-4 h-4" />
                        View Logs
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}