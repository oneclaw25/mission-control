// GitHub API Client

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  isCloned?: boolean;
  localPath?: string;
}

export interface GitCommit {
  hash?: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  date?: string;
  sha?: string;
  commit?: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  };
}

export interface GitBranch {
  name: string;
  commit?: {
    sha: string;
  };
}

export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  run_number: number;
  status: string;
  conclusion: string | null;
  workflow_id: number;
  html_url: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = '/api/github';

export const githubAPI = {
  // Repositories
  async listRepos(type: string = 'owner', sort: string = 'updated'): Promise<{ repos: GitHubRepo[]; localRepos: any[] }> {
    const response = await fetch(`${API_BASE}?action=repos&type=${type}&sort=${sort}`);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
  },

  async createRepo(name: string, description: string, isPrivate: boolean = true): Promise<GitHubRepo> {
    const response = await fetch(`${API_BASE}?action=repos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, isPrivate }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create repository');
    }
    return response.json();
  },

  async cloneRepo(owner: string, repo: string): Promise<{ message: string; path: string }> {
    const response = await fetch(`${API_BASE}?action=clone&owner=${owner}&repo=${repo}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to clone repository');
    return response.json();
  },

  // Commits
  async listCommits(owner: string, repo: string, sha: string = 'main', perPage: number = 30): Promise<{ commits: GitCommit[]; source: string }> {
    const response = await fetch(`${API_BASE}?action=commits&owner=${owner}&repo=${repo}&sha=${sha}&per_page=${perPage}`);
    if (!response.ok) throw new Error('Failed to fetch commits');
    return response.json();
  },

  async createCommit(owner: string, repo: string, message: string, files: Array<{ path: string; content: string }>, branch: string = 'main'): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}?action=commit&owner=${owner}&repo=${repo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, files, branch }),
    });
    if (!response.ok) throw new Error('Failed to create commit');
    return response.json();
  },

  // Branches
  async listBranches(owner: string, repo: string): Promise<{ branches: string[] | GitBranch[]; source: string }> {
    const response = await fetch(`${API_BASE}?action=branches&owner=${owner}&repo=${repo}`);
    if (!response.ok) throw new Error('Failed to fetch branches');
    return response.json();
  },

  // Contents
  async getContents(owner: string, repo: string, path: string = ''): Promise<{ type: string; path: string; content?: string; items?: any[] }> {
    const response = await fetch(`${API_BASE}?action=contents&owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to fetch contents');
    return response.json();
  },

  // Workflows
  async listWorkflows(owner: string, repo: string): Promise<{ workflows: Workflow[] }> {
    const response = await fetch(`${API_BASE}?action=workflows&owner=${owner}&repo=${repo}`);
    if (!response.ok) return { workflows: [] };
    return response.json();
  },

  async listWorkflowRuns(owner: string, repo: string, workflowId?: number): Promise<{ workflow_runs: WorkflowRun[] }> {
    const url = workflowId 
      ? `${API_BASE}?action=workflow-runs&owner=${owner}&repo=${repo}&workflow_id=${workflowId}`
      : `${API_BASE}?action=workflow-runs&owner=${owner}&repo=${repo}`;
    const response = await fetch(url);
    if (!response.ok) return { workflow_runs: [] };
    return response.json();
  },

  async triggerWorkflow(owner: string, repo: string, workflowId: number, ref: string = 'main', inputs: Record<string, string> = {}): Promise<void> {
    const response = await fetch(`${API_BASE}?action=trigger-workflow&owner=${owner}&repo=${repo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_id: workflowId, ref, inputs }),
    });
    if (!response.ok) throw new Error('Failed to trigger workflow');
  },
};