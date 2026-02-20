// Files API Client

export interface FileItem {
  name: string;
  type: 'file' | 'dir';
  path: string;
  size?: number | null;
  modified?: string;
  gitStatus?: string | null;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  modified: string;
}

export interface GitStatus {
  branch: string;
  isClean: boolean;
  files: Array<{
    status: string;
    statusText: string;
    path: string;
  }>;
}

const API_BASE = '/api/files';

export const filesAPI = {
  // List directory contents
  async listFiles(path: string = '', project?: string): Promise<{ type: string; path: string; items: FileItem[] }> {
    const params = new URLSearchParams({ action: 'list', path });
    if (project) params.append('project', project);
    
    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to list files');
    return response.json();
  },

  // Read file content
  async readFile(filePath: string, project?: string): Promise<FileContent> {
    const params = new URLSearchParams({ action: 'read', path: filePath });
    if (project) params.append('project', project);
    
    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to read file');
    return response.json();
  },

  // Write file content
  async writeFile(filePath: string, content: string, project?: string, commit: boolean = false, commitMessage?: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}?action=write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content, project, commit, commitMessage }),
    });
    if (!response.ok) throw new Error('Failed to write file');
    return response.json();
  },

  // Create directory
  async createDirectory(dirPath: string, project?: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}?action=mkdir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: dirPath, project }),
    });
    if (!response.ok) throw new Error('Failed to create directory');
    return response.json();
  },

  // Delete file or directory
  async deleteFile(filePath: string, project?: string): Promise<{ success: boolean }> {
    const params = new URLSearchParams({ action: 'delete', path: filePath });
    if (project) params.append('project', project);
    
    const response = await fetch(`${API_BASE}?${params.toString()}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return response.json();
  },

  // Get git status for project
  async getGitStatus(project: string): Promise<GitStatus> {
    const response = await fetch(`${API_BASE}?action=git-status&project=${project}`);
    if (!response.ok) throw new Error('Failed to get git status');
    return response.json();
  },

  // Save file with auto-commit
  async saveAndCommit(filePath: string, content: string, project: string, message?: string): Promise<{ success: boolean; message: string }> {
    return this.writeFile(filePath, content, project, true, message || `Update ${filePath}`);
  },
};