import { useState, useEffect, useCallback } from 'react';
import { githubAPI, GitHubRepo, GitCommit, GitBranch, Workflow, WorkflowRun } from '../lib/github';

export function useGitHub() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [localRepos, setLocalRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await githubAPI.listRepos();
      setRepos(data.repos);
      setLocalRepos(data.localRepos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRepo = useCallback(async (name: string, description: string, isPrivate: boolean = true) => {
    try {
      const repo = await githubAPI.createRepo(name, description, isPrivate);
      await fetchRepos();
      return repo;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchRepos]);

  const cloneRepo = useCallback(async (owner: string, repo: string) => {
    try {
      const result = await githubAPI.cloneRepo(owner, repo);
      await fetchRepos();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchRepos]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return {
    repos,
    localRepos,
    loading,
    error,
    refresh: fetchRepos,
    createRepo,
    cloneRepo,
  };
}

export function useGitHubCommits(owner: string, repo: string, sha: string = 'main') {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = useCallback(async () => {
    if (!owner || !repo) return;
    setLoading(true);
    setError(null);
    try {
      const data = await githubAPI.listCommits(owner, repo, sha);
      setCommits(data.commits);
      setSource(data.source);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, sha]);

  useEffect(() => {
    fetchCommits();
  }, [fetchCommits]);

  return { commits, source, loading, error, refresh: fetchCommits };
}

export function useGitHubBranches(owner: string, repo: string) {
  const [branches, setBranches] = useState<string[]>([]);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    if (!owner || !repo) return;
    setLoading(true);
    setError(null);
    try {
      const data = await githubAPI.listBranches(owner, repo);
      setBranches(Array.isArray(data.branches) ? data.branches.map((b: any) => typeof b === 'string' ? b : b.name) : []);
      setSource(data.source);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return { branches, source, loading, error, refresh: fetchBranches };
}

export function useGitHubWorkflows(owner: string, repo: string) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    if (!owner || !repo) return;
    setLoading(true);
    setError(null);
    try {
      const [workflowsData, runsData] = await Promise.all([
        githubAPI.listWorkflows(owner, repo),
        githubAPI.listWorkflowRuns(owner, repo),
      ]);
      setWorkflows(workflowsData.workflows);
      setRuns(runsData.workflow_runs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  const triggerWorkflow = useCallback(async (workflowId: number, ref: string = 'main', inputs: Record<string, string> = {}) => {
    try {
      await githubAPI.triggerWorkflow(owner, repo, workflowId, ref, inputs);
      await fetchWorkflows();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [owner, repo, fetchWorkflows]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return { workflows, runs, loading, error, refresh: fetchWorkflows, triggerWorkflow };
}