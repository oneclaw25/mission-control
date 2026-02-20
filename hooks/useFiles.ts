import { useState, useEffect, useCallback } from 'react';
import { filesAPI, FileItem, FileContent, GitStatus } from '../lib/files';

export function useFileBrowser(project?: string) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);

  const fetchFiles = useCallback(async (path: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesAPI.listFiles(path, project);
      setItems(data.items || []);
      setCurrentPath(data.path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  const fetchGitStatus = useCallback(async () => {
    if (!project) return;
    try {
      const status = await filesAPI.getGitStatus(project);
      setGitStatus(status);
    } catch (err) {
      setGitStatus(null);
    }
  }, [project]);

  const createDirectory = useCallback(async (dirPath: string) => {
    try {
      await filesAPI.createDirectory(dirPath, project);
      await fetchFiles(currentPath);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [project, currentPath, fetchFiles]);

  const deleteItem = useCallback(async (itemPath: string) => {
    try {
      await filesAPI.deleteFile(itemPath, project);
      await fetchFiles(currentPath);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [project, currentPath, fetchFiles]);

  const navigate = useCallback((newPath: string) => {
    fetchFiles(newPath);
  }, [fetchFiles]);

  const navigateUp = useCallback(() => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    fetchFiles(parentPath);
  }, [currentPath, fetchFiles]);

  useEffect(() => {
    fetchFiles();
    fetchGitStatus();
  }, [fetchFiles, fetchGitStatus]);

  return {
    items,
    currentPath,
    loading,
    error,
    gitStatus,
    refresh: () => { fetchFiles(currentPath); fetchGitStatus(); },
    navigate,
    navigateUp,
    createDirectory,
    deleteItem,
  };
}

export function useFileEditor(project?: string, filePath?: string) {
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const fetchContent = useCallback(async () => {
    if (!project || !filePath) return;
    setLoading(true);
    setError(null);
    try {
      const data = await filesAPI.readFile(filePath, project);
      setContent(data.content);
      setOriginalContent(data.content);
      setIsDirty(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [project, filePath]);

  const saveContent = useCallback(async (commit: boolean = false, message?: string) => {
    if (!project || !filePath) return false;
    setSaving(true);
    setError(null);
    try {
      await filesAPI.writeFile(filePath, content, project, commit, message);
      setOriginalContent(content);
      setIsDirty(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [project, filePath, content]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(newContent !== originalContent);
  }, [originalContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    originalContent,
    loading,
    saving,
    error,
    isDirty,
    updateContent,
    saveContent,
    refresh: fetchContent,
    reset: () => {
      setContent(originalContent);
      setIsDirty(false);
    },
  };
}