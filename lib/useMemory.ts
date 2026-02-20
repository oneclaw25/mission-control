import { useState, useEffect, useCallback } from 'react';

export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  type: 'decision' | 'lesson' | 'context' | 'action' | 'note';
  source: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
}

export interface MemoryFile {
  filename: string;
  size: number;
  modified: string;
  created: string;
  entryCount: number;
  tags: string[];
}

interface UseMemoryReturn {
  entries: MemoryEntry[];
  files: MemoryFile[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, filters?: { source?: string; date?: string; type?: string }) => Promise<void>;
  refresh: () => Promise<void>;
  createEntry: (entry: { title: string; content: string; date?: string; tags?: string[]; type?: string }) => Promise<boolean>;
  updateEntry: (id: string, updates: Partial<MemoryEntry>) => Promise<boolean>;
  totalEntries: number;
  totalFiles: number;
}

export function useMemory(): UseMemoryReturn {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/memory/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files || []);
      setTotalFiles(data.total || 0);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  }, []);

  const search = useCallback(async (query: string, filters?: { source?: string; date?: string; type?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters?.source) params.append('source', filters.source);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.type) params.append('type', filters.type);
      
      const response = await fetch(`/api/memory?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search memory');
      
      const data = await response.json();
      setEntries(data.entries || []);
      setTotalEntries(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch entries
      const entriesResponse = await fetch('/api/memory');
      if (!entriesResponse.ok) throw new Error('Failed to refresh memory');
      const entriesData = await entriesResponse.json();
      setEntries(entriesData.entries || []);
      setTotalEntries(entriesData.total || 0);
      
      // Fetch files
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFiles]);

  const createEntry = useCallback(async (entry: { title: string; content: string; date?: string; tags?: string[]; type?: string }) => {
    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) throw new Error('Failed to create entry');
      
      // Refresh after creation
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [refresh]);

  const updateEntry = useCallback(async (id: string, updates: Partial<MemoryEntry>) => {
    try {
      const response = await fetch(`/api/memory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update entry');
      
      // Refresh after update
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    entries,
    files,
    isLoading,
    error,
    search,
    refresh,
    createEntry,
    updateEntry,
    totalEntries,
    totalFiles,
  };
}
