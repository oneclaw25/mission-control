import { NextApiRequest, NextApiResponse } from 'next';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_API_BASE = 'https://api.github.com';

// Local projects base path
const PROJECTS_BASE_PATH = process.env.PROJECTS_PATH || path.join(process.env.HOME || '', 'workspace', 'projects');

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_BASE_PATH)) {
  fs.mkdirSync(PROJECTS_BASE_PATH, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { action, owner, repo, path: filePath } = req.query;

  try {
    switch (method) {
      case 'GET':
        // Default: list repos if no action specified
        if (!action || action === 'repos') {
          return await listRepos(req, res);
        } else if (action === 'commits' && owner && repo) {
          return await listCommits(req, res, owner as string, repo as string);
        } else if (action === 'branches' && owner && repo) {
          return await listBranches(req, res, owner as string, repo as string);
        } else if (action === 'contents' && owner && repo) {
          return await getContents(req, res, owner as string, repo as string, filePath as string);
        } else if (action === 'workflows' && owner && repo) {
          return await listWorkflows(req, res, owner as string, repo as string);
        } else if (action === 'workflow-runs' && owner && repo) {
          return await listWorkflowRuns(req, res, owner as string, repo as string);
        }
        break;

      case 'POST':
        if (action === 'repos') {
          return await createRepo(req, res);
        } else if (action === 'clone' && owner && repo) {
          return await cloneRepo(req, res, owner as string, repo as string);
        } else if (action === 'commit' && owner && repo) {
          return await createCommit(req, res, owner as string, repo as string);
        } else if (action === 'trigger-workflow' && owner && repo) {
          return await triggerWorkflow(req, res, owner as string, repo as string);
        }
        break;
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function listRepos(req: NextApiRequest, res: NextApiResponse) {
  const { type = 'owner', sort = 'updated' } = req.query;
  
  if (!GITHUB_TOKEN) {
    // Return local repos if no GitHub token
    const localRepos = getLocalRepos();
    return res.status(200).json({ repos: [], localRepos });
  }

  const response = await fetch(`${GITHUB_API_BASE}/user/repos?type=${type}&sort=${sort}&per_page=100`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos = await response.json();
  const localRepos = getLocalRepos();

  // Merge local status with GitHub repos
  const enhancedRepos = repos.map((r: any) => ({
    ...r,
    localPath: localRepos.find(lr => lr.name === r.name)?.path,
    isCloned: localRepos.some(lr => lr.name === r.name),
  }));

  return res.status(200).json({ repos: enhancedRepos, localRepos });
}

async function listCommits(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  const { sha = 'main', per_page = '30' } = req.query;

  // Try local git first
  const localPath = path.join(PROJECTS_BASE_PATH, repo);
  if (fs.existsSync(localPath)) {
    try {
      const { stdout } = await execAsync(
        `git log ${sha} --oneline --pretty=format:"%H|%s|%an|%ae|%ad" --date=short -n ${per_page}`,
        { cwd: localPath }
      );
      
      const commits = stdout.split('\n').filter(Boolean).map(line => {
        const [hash, message, authorName, authorEmail, date] = line.split('|');
        return { hash, message, authorName, authorEmail, date };
      });

      return res.status(200).json({ commits, source: 'local' });
    } catch (e) {
      // Fall through to GitHub API
    }
  }

  // Fall back to GitHub API
  if (!GITHUB_TOKEN) {
    return res.status(200).json({ commits: [], source: 'github', error: 'No GitHub token' });
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?sha=${sha}&per_page=${per_page}`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const commits = await response.json();
  return res.status(200).json({ commits, source: 'github' });
}

async function listBranches(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  const localPath = path.join(PROJECTS_BASE_PATH, repo);
  
  if (fs.existsSync(localPath)) {
    try {
      const { stdout } = await execAsync('git branch -a --format="%(refname:short)"', { cwd: localPath });
      const branches = stdout.split('\n').filter(Boolean);
      return res.status(200).json({ branches, source: 'local' });
    } catch (e) {
      // Fall through
    }
  }

  if (!GITHUB_TOKEN) {
    return res.status(200).json({ branches: [], source: 'github', error: 'No GitHub token' });
  }

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const branches = await response.json();
  return res.status(200).json({ branches: branches.map((b: any) => b.name), source: 'github' });
}

async function getContents(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string, filePath?: string) {
  const localPath = path.join(PROJECTS_BASE_PATH, repo);
  const targetPath = filePath ? path.join(localPath, filePath) : localPath;

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'Path not found' });
  }

  const stats = fs.statSync(targetPath);
  
  if (stats.isFile()) {
    const content = fs.readFileSync(targetPath, 'utf-8');
    return res.status(200).json({ type: 'file', path: filePath, content });
  } else {
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    const items = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'dir' : 'file',
      path: filePath ? `${filePath}/${entry.name}` : entry.name,
    }));
    return res.status(200).json({ type: 'dir', path: filePath || '', items });
  }
}

async function createRepo(req: NextApiRequest, res: NextApiResponse) {
  if (!GITHUB_TOKEN) {
    // Create local-only repo
    const { name, description, isPrivate = true } = req.body;
    const localPath = path.join(PROJECTS_BASE_PATH, name);
    
    fs.mkdirSync(localPath, { recursive: true });
    await execAsync('git init', { cwd: localPath });
    
    // Create initial README
    fs.writeFileSync(path.join(localPath, 'README.md'), `# ${name}\n\n${description || ''}\n`);
    await execAsync('git add .', { cwd: localPath });
    await execAsync('git commit -m "Initial commit"', { cwd: localPath });

    return res.status(201).json({ 
      message: 'Local repository created',
      name,
      localPath,
      html_url: null,
    });
  }

  const { name, description, isPrivate = true } = req.body;

  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description, private: isPrivate }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create repository');
  }

  const repo = await response.json();
  
  // Clone locally
  await cloneRepoInternal(repo.clone_url, repo.name);

  return res.status(201).json(repo);
}

async function cloneRepo(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  const localPath = path.join(PROJECTS_BASE_PATH, repo);

  if (fs.existsSync(localPath)) {
    return res.status(200).json({ message: 'Repository already cloned', path: localPath });
  }

  await cloneRepoInternal(cloneUrl, repo);
  return res.status(200).json({ message: 'Repository cloned successfully', path: localPath });
}

async function cloneRepoInternal(cloneUrl: string, repoName: string) {
  const localPath = path.join(PROJECTS_BASE_PATH, repoName);
  fs.mkdirSync(PROJECTS_BASE_PATH, { recursive: true });
  
  const authUrl = GITHUB_TOKEN 
    ? cloneUrl.replace('https://', `https://${GITHUB_TOKEN}@`)
    : cloneUrl;
    
  await execAsync(`git clone ${authUrl} "${localPath}"`);
}

async function createCommit(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  const { message, files, branch = 'main' } = req.body;
  const localPath = path.join(PROJECTS_BASE_PATH, repo);

  if (!fs.existsSync(localPath)) {
    return res.status(404).json({ error: 'Repository not found locally' });
  }

  // Write files
  for (const file of files || []) {
    const filePath = path.join(localPath, file.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content);
  }

  // Git add, commit, push
  await execAsync('git add .', { cwd: localPath });
  await execAsync(`git commit -m "${message}"`, { cwd: localPath });
  
  try {
    await execAsync(`git push origin ${branch}`, { cwd: localPath });
  } catch (e) {
    // Push may fail if no remote
  }

  return res.status(200).json({ message: 'Commit created successfully' });
}

async function listWorkflows(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  if (!GITHUB_TOKEN) {
    return res.status(200).json({ workflows: [] });
  }

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    return res.status(200).json({ workflows: [] });
  }

  const data = await response.json();
  return res.status(200).json({ workflows: data.workflows || [] });
}

async function listWorkflowRuns(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  if (!GITHUB_TOKEN) {
    return res.status(200).json({ workflow_runs: [] });
  }

  const { workflow_id } = req.query;
  const url = workflow_id 
    ? `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs`
    : `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    return res.status(200).json({ workflow_runs: [] });
  }

  const data = await response.json();
  return res.status(200).json({ workflow_runs: data.workflow_runs || [] });
}

async function triggerWorkflow(req: NextApiRequest, res: NextApiResponse, owner: string, repo: string) {
  if (!GITHUB_TOKEN) {
    return res.status(400).json({ error: 'GitHub token not configured' });
  }

  const { workflow_id, ref = 'main', inputs = {} } = req.body;

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, inputs }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to trigger workflow');
  }

  return res.status(204).end();
}

function getLocalRepos() {
  if (!fs.existsSync(PROJECTS_BASE_PATH)) return [];
  
  return fs.readdirSync(PROJECTS_BASE_PATH)
    .filter(name => {
      const fullPath = path.join(PROJECTS_BASE_PATH, name);
      return fs.statSync(fullPath).isDirectory() && 
             fs.existsSync(path.join(fullPath, '.git'));
    })
    .map(name => ({
      name,
      path: path.join(PROJECTS_BASE_PATH, name),
    }));
}