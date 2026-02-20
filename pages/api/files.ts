import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Base path for all projects
const PROJECTS_BASE_PATH = process.env.PROJECTS_PATH || path.join(process.env.HOME || '', 'workspace', 'projects');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { action, project } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (action === 'list') {
          return await listFiles(req, res);
        } else if (action === 'read') {
          return await readFile(req, res);
        } else if (action === 'git-status' && project) {
          return await getGitStatus(req, res, project as string);
        }
        break;

      case 'POST':
        if (action === 'write') {
          return await writeFile(req, res);
        } else if (action === 'mkdir') {
          return await createDirectory(req, res);
        }
        break;

      case 'DELETE':
        if (action === 'delete') {
          return await deleteFile(req, res);
        }
        break;
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('Files API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function listFiles(req: NextApiRequest, res: NextApiResponse) {
  const { path: relativePath = '', project } = req.query;
  
  const basePath = project 
    ? path.join(PROJECTS_BASE_PATH, project as string)
    : PROJECTS_BASE_PATH;
    
  const targetPath = path.join(basePath, relativePath as string);

  // Security check - ensure we don't escape the base path
  if (!targetPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'Path not found' });
  }

  const stats = fs.statSync(targetPath);
  
  if (stats.isFile()) {
    const content = fs.readFileSync(targetPath, 'utf-8');
    return res.status(200).json({
      type: 'file',
      path: relativePath,
      name: path.basename(targetPath),
      content,
      size: stats.size,
      modified: stats.mtime,
    });
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  
  // Get git status for each file if in a git repo
  let gitStatus: Record<string, string> = {};
  try {
    const gitStatusOutput = execSync('git status --porcelain', { cwd: targetPath, encoding: 'utf-8' });
    gitStatusOutput.split('\n').forEach(line => {
      if (line.length >= 3) {
        const status = line.substring(0, 2).trim();
        const filePath = line.substring(3);
        gitStatus[filePath] = status;
      }
    });
  } catch (e) {
    // Not a git repo or error
  }

  const items = entries.map(entry => {
    const itemPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const fullPath = path.join(targetPath, entry.name);
    const itemStats = fs.statSync(fullPath);
    
    return {
      name: entry.name,
      type: entry.isDirectory() ? 'dir' : 'file',
      path: itemPath,
      size: entry.isFile() ? itemStats.size : null,
      modified: itemStats.mtime,
      gitStatus: gitStatus[itemPath] || null,
    };
  });

  // Sort: directories first, then files
  items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'dir' ? -1 : 1;
  });

  return res.status(200).json({
    type: 'directory',
    path: relativePath,
    items,
  });
}

async function readFile(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath, project } = req.query;
  
  if (!filePath) {
    return res.status(400).json({ error: 'Path required' });
  }

  const basePath = project 
    ? path.join(PROJECTS_BASE_PATH, project as string)
    : PROJECTS_BASE_PATH;
    
  const targetPath = path.join(basePath, filePath as string);

  if (!targetPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    return res.status(404).json({ error: 'File not found' });
  }

  const content = fs.readFileSync(targetPath, 'utf-8');
  const stats = fs.statSync(targetPath);

  return res.status(200).json({
    path: filePath,
    content,
    size: stats.size,
    modified: stats.mtime,
  });
}

async function writeFile(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath, content, project, commit = false, commitMessage } = req.body;
  
  if (!filePath) {
    return res.status(400).json({ error: 'Path required' });
  }

  const basePath = project 
    ? path.join(PROJECTS_BASE_PATH, project as string)
    : PROJECTS_BASE_PATH;
    
  const targetPath = path.join(basePath, filePath);

  if (!targetPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Ensure directory exists
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  
  // Write file
  fs.writeFileSync(targetPath, content, 'utf-8');

  // Auto-commit if requested
  if (commit && fs.existsSync(path.join(basePath, '.git'))) {
    try {
      execSync('git add .', { cwd: basePath });
      execSync(`git commit -m "${commitMessage || `Update ${path.basename(filePath)}`}"`, { 
        cwd: basePath,
        stdio: 'pipe'
      });
    } catch (e) {
      // Commit may fail if no changes
    }
  }

  return res.status(200).json({ 
    success: true, 
    path: filePath,
    message: commit ? 'File saved and committed' : 'File saved'
  });
}

async function createDirectory(req: NextApiRequest, res: NextApiResponse) {
  const { path: dirPath, project } = req.body;
  
  if (!dirPath) {
    return res.status(400).json({ error: 'Path required' });
  }

  const basePath = project 
    ? path.join(PROJECTS_BASE_PATH, project as string)
    : PROJECTS_BASE_PATH;
    
  const targetPath = path.join(basePath, dirPath);

  if (!targetPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  fs.mkdirSync(targetPath, { recursive: true });

  return res.status(200).json({ success: true, path: dirPath });
}

async function deleteFile(req: NextApiRequest, res: NextApiResponse) {
  const { path: targetPath, project } = req.query;
  
  if (!targetPath) {
    return res.status(400).json({ error: 'Path required' });
  }

  const basePath = project 
    ? path.join(PROJECTS_BASE_PATH, project as string)
    : PROJECTS_BASE_PATH;
    
  const fullPath = path.join(basePath, targetPath as string);

  if (!fullPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const stats = fs.statSync(fullPath);
  
  if (stats.isDirectory()) {
    fs.rmdirSync(fullPath, { recursive: true });
  } else {
    fs.unlinkSync(fullPath);
  }

  return res.status(200).json({ success: true, deleted: targetPath });
}

async function getGitStatus(req: NextApiRequest, res: NextApiResponse, project: string) {
  const projectPath = path.join(PROJECTS_BASE_PATH, project);
  
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }

  try {
    const statusOutput = execSync('git status --porcelain', { 
      cwd: projectPath, 
      encoding: 'utf-8' 
    });

    const branchOutput = execSync('git branch --show-current', { 
      cwd: projectPath, 
      encoding: 'utf-8' 
    }).trim();

    const files = statusOutput.split('\n')
      .filter(line => line.length >= 3)
      .map(line => ({
        status: line.substring(0, 2).trim(),
        statusText: parseGitStatus(line.substring(0, 2)),
        path: line.substring(3),
      }));

    return res.status(200).json({
      branch: branchOutput,
      isClean: files.length === 0,
      files,
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Not a git repository', details: e.message });
  }
}

function parseGitStatus(status: string): string {
  const staged = status[0] || ' ';
  const unstaged = status[1] || ' ';
  
  if (staged === 'A' || unstaged === 'A') return 'added';
  if (staged === 'M' || unstaged === 'M') return 'modified';
  if (staged === 'D' || unstaged === 'D') return 'deleted';
  if (staged === 'R' || unstaged === 'R') return 'renamed';
  if (staged === 'C' || unstaged === 'C') return 'copied';
  if (staged === 'U' || unstaged === 'U') return 'updated';
  if (staged === '?' || unstaged === '?') return 'untracked';
  return 'unknown';
}