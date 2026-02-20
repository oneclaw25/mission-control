import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  GitBranch,
  GitCommit,
  ExternalLink,
  Clock,
  Star,
  MoreHorizontal,
  Code,
  Terminal,
  RefreshCw,
  Github,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';
import { useGitHub, useGitHubCommits, useGitHubBranches } from '../hooks/useGitHub';
import { GitHubRepo, GitCommit as GitHubCommit } from '../lib/github';
import FileBrowser, { FileEditor } from './FileBrowser';

interface ProjectWithRepo {
  repo: GitHubRepo;
  lastCommit?: GitHubCommit;
}

export default function ProjectsLive() {
  const { repos, localRepos, loading, error, refresh, createRepo, cloneRepo } = useGitHub();
  const [view, setView] = useState<'list' | 'detail' | 'files'>('list');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'local' | 'github'>('all');

  // New repo form state
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) return;
    setCreating(true);
    try {
      await createRepo(newRepoName, newRepoDesc, newRepoPrivate);
      setShowNewRepo(false);
      setNewRepoName('');
      setNewRepoDesc('');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setView('detail');
  };

  const handleOpenFiles = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setView('files');
    setSelectedFile(null);
  };

  const handleClone = async (repo: GitHubRepo) => {
    const owner = repo.full_name?.split('/')[0];
    if (!owner) return;
    await cloneRepo(owner, repo.name);
  };

  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ? true :
                         filter === 'local' ? repo.isCloned :
                         filter === 'github' ? !repo.isCloned : true;
    return matchesSearch && matchesFilter;
  });

  if (view === 'files' && selectedRepo) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('list')}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-white">{selectedRepo.name}</h2>
            <span className="text-sm text-gray-500">File Browser</span>
          </div>
        </div>
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="w-64 flex-shrink-0">
            <FileBrowser
              project={selectedRepo.name}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile || undefined}
            />
          </div>
          <div className="flex-1 min-h-0">
            {selectedFile ? (
              <FileEditor
                project={selectedRepo.name}
                filePath={selectedFile}
                onClose={() => setSelectedFile(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a file to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedRepo) {
    return (
      <ProjectDetail
        repo={selectedRepo}
        onBack={() => setView('list')}
        onOpenFiles={() => handleOpenFiles(selectedRepo)}
        onClone={() => handleClone(selectedRepo)}
      />
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Github className="w-6 h-6 text-gray-400" />
            Projects
          </h2>
          <p className="text-gray-400">Manage your Git repositories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNewRepo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Repository
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          {(['all', 'local', 'github'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* New Repo Modal */}
      {showNewRepo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Repository</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Repository Name</label>
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Description (optional)</label>
                <textarea
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  placeholder="What is this project about?"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-20 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRepoPrivate}
                  onChange={(e) => setNewRepoPrivate(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-700"
                />
                <span className="text-sm text-gray-300">Private repository</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateRepo}
                disabled={!newRepoName.trim() || creating}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg"
              >
                {creating ? 'Creating...' : 'Create Repository'}
              </button>
              <button
                onClick={() => setShowNewRepo(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repository Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            onSelect={() => handleSelectRepo(repo)}
            onOpenFiles={() => handleOpenFiles(repo)}
            onClone={() => handleClone(repo)}
          />
        ))}
      </div>

      {filteredRepos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Github className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No repositories found</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12 text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}

function RepoCard({ 
  repo, 
  onSelect, 
  onOpenFiles, 
  onClone 
}: { 
  repo: GitHubRepo; 
  onSelect: () => void;
  onOpenFiles: () => void;
  onClone: () => void;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            repo.isCloned ? 'bg-green-600/20' : 'bg-gray-800'
          }`}>
            {repo.isCloned ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Github className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{repo.name}</h3>
            <p className="text-xs text-gray-500">
              {repo.private ? 'Private' : 'Public'} • {repo.language || 'No language'}
            </p>
          </div>
        </div>
        {repo.isCloned && (
          <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded">
            Local
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {repo.description || 'No description'}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          {repo.forks_count}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(repo.updated_at).toLocaleDateString()}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          Details
        </button>
        {repo.isCloned ? (
          <button
            onClick={onOpenFiles}
            className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Code className="w-4 h-4" />
            Files
          </button>
        ) : (
          <button
            onClick={onClone}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Clone
          </button>
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ 
  repo, 
  onBack, 
  onOpenFiles, 
  onClone 
}: { 
  repo: GitHubRepo; 
  onBack: () => void;
  onOpenFiles: () => void;
  onClone: () => void;
}) {
  const owner = repo.full_name?.split('/')[0] || '';
  const { commits, loading: commitsLoading } = useGitHubCommits(owner, repo.name, repo.default_branch);
  const { branches, loading: branchesLoading } = useGitHubBranches(owner, repo.name);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits'>('overview');

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{repo.name}</h2>
            <p className="text-sm text-gray-500">{repo.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {repo.isCloned ? (
            <button
              onClick={onOpenFiles}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Code className="w-4 h-4" />
              Browse Files
            </button>
          ) : (
            <button
              onClick={onClone}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Terminal className="w-4 h-4" />
              Clone Locally
            </button>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg"
          >
            <ExternalLink className="w-4 h-4" />
            Open in GitHub
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Stars" value={repo.stargazers_count} icon={Star} />
        <StatCard label="Forks" value={repo.forks_count} icon={GitBranch} />
        <StatCard label="Issues" value={repo.open_issues_count} icon={AlertCircle} />
        <StatCard label="Branches" value={branchesLoading ? '...' : branches.length} icon={GitBranch} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 mb-6">
        {(['overview', 'commits'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              activeTab === tab
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">About</h3>
            <p className="text-gray-300">{repo.description || 'No description provided.'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {repo.language && (
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  {repo.language}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                {repo.private ? 'Private' : 'Public'}
              </span>
              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                Default: {repo.default_branch}
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Clone URLs</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase">HTTPS</label>
                <code className="block mt-1 p-3 bg-gray-950 rounded text-sm text-gray-300 font-mono">
                  {repo.clone_url}
                </code>
              </div>
              {repo.ssh_url && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">SSH</label>
                  <code className="block mt-1 p-3 bg-gray-950 rounded text-sm text-gray-300 font-mono">
                    {repo.ssh_url}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {commitsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {commits.map((commit, i) => (
                <div key={i} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <GitCommit className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {commit.message || commit.commit?.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{commit.authorName || commit.author?.login || commit.commit?.author?.name}</span>
                        <span>•</span>
                        <span>{commit.date || commit.commit?.author?.date ? 
                          new Date(commit.date || commit.commit?.author?.date || '').toLocaleDateString() : 
                          ''
                        }</span>
                        {commit.hash && (
                          <>
                            <span>•</span>
                            <code className="font-mono">{commit.hash.slice(0, 7)}</code>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {commits.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  No commits found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-800 rounded-lg">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}