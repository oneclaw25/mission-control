import React, { useState, useCallback } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus,
  Trash2,
  Save,
  X,
  GitBranch,
  Circle,
  CheckCircle,
  FileCode,
  FileText,
  FileImage,
  FolderOpen,
} from 'lucide-react';
import { useFileBrowser, useFileEditor } from '../hooks/useFiles';
import { FileItem } from '../lib/files';

interface FileBrowserProps {
  project: string;
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
}

// File type icons
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'php', 'rb'];
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];
  const textExts = ['md', 'txt', 'json', 'yml', 'yaml', 'toml', 'ini', 'conf'];
  
  if (codeExts.includes(ext || '')) return <FileCode className="w-4 h-4 text-yellow-400" />;
  if (imageExts.includes(ext || '')) return <FileImage className="w-4 h-4 text-purple-400" />;
  if (textExts.includes(ext || '')) return <FileText className="w-4 h-4 text-blue-400" />;
  return <File className="w-4 h-4 text-gray-400" />;
};

// Git status indicator
const GitStatusIndicator = ({ status }: { status?: string | null }) => {
  if (!status) return null;
  
  const colors: Record<string, string> = {
    added: 'text-green-400',
    modified: 'text-yellow-400',
    deleted: 'text-red-400',
    untracked: 'text-gray-400',
    renamed: 'text-blue-400',
  };
  
  return (
    <div className={`w-2 h-2 rounded-full ${colors[status] || 'text-gray-400'} bg-current`} />
  );
};

export default function FileBrowser({ project, onFileSelect, selectedFile }: FileBrowserProps) {
  const {
    items,
    currentPath,
    loading,
    error,
    gitStatus,
    navigate,
    navigateUp,
    refresh,
    createDirectory,
    deleteItem,
  } = useFileBrowser(project);

  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem } | null>(null);

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const fullPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
    await createDirectory(fullPath);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    await deleteItem(item.path);
    setContextMenu(null);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'dir') {
      toggleDir(item.path);
      navigate(item.path);
    } else {
      onFileSelect?.(item.path);
    }
  };

  // Build tree structure
  const buildTree = (items: FileItem[]): FileItem[] => {
    // For now, just return flat list - could be enhanced to build a tree
    return items;
  };

  const treeItems = buildTree(items);

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateUp}
            disabled={!currentPath}
            className="p-1 hover:bg-gray-800 rounded disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4 text-gray-400 rotate-90" />
          </button>
          <span className="text-sm font-medium text-gray-300 truncate max-w-[150px]">
            {currentPath || project}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFolder(true)}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
            title="New Folder"
          >
            <Folder className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Git Status */}
      {gitStatus && (
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-800">
          <div className="flex items-center gap-2 text-xs">
            <GitBranch className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">{gitStatus.branch}</span>
            <span className={gitStatus.isClean ? 'text-green-400' : 'text-yellow-400'}>
              {gitStatus.isClean ? '✓ clean' : `${gitStatus.files.length} changes`}
            </span>
          </div>
        </div>
      )}

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="px-3 py-2 border-b border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="p-1 bg-blue-600 rounded text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
              className="p-1 bg-gray-700 rounded text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-400">{error}</div>
        ) : (
          <div className="py-1">
            {treeItems.map((item) => (
              <FileTreeItem
                key={item.path}
                item={item}
                depth={item.path.split('/').length - 1}
                isSelected={selectedFile === item.path}
                isExpanded={expandedDirs.has(item.path)}
                onClick={() => handleItemClick(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, item });
                }}
              />
            ))}
            {treeItems.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                Empty directory
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[150px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleDelete(contextMenu.item)}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FileTreeItem({
  item,
  depth,
  isSelected,
  isExpanded,
  onClick,
  onContextMenu,
}: {
  item: FileItem;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const paddingLeft = 12 + depth * 16;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-600/20 border-r-2 border-blue-500'
          : 'hover:bg-gray-800 border-r-2 border-transparent'
      }`}
      style={{ paddingLeft }}
    >
      {item.type === 'dir' ? (
        isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )
      ) : (
        <span className="w-4" />
      )}
      
      {item.type === 'dir' ? (
        isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-400" />
        ) : (
          <Folder className="w-4 h-4 text-blue-400" />
        )
      ) : (
        getFileIcon(item.name)
      )}
      
      <span className={`text-sm truncate flex-1 ${
        isSelected ? 'text-blue-300' : 'text-gray-300'
      }`}>
        {item.name}
      </span>
      
      <GitStatusIndicator status={item.gitStatus} />
    </div>
  );
}

// Simple Text Editor Component
interface FileEditorProps {
  project: string;
  filePath: string;
  onClose?: () => void;
}

export function FileEditor({ project, filePath, onClose }: FileEditorProps) {
  const {
    content,
    loading,
    saving,
    isDirty,
    updateContent,
    saveContent,
    reset,
  } = useFileEditor(project, filePath);

  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);

  const handleSave = async (commit: boolean = false) => {
    const success = await saveContent(commit, commitMessage || undefined);
    if (success && commit) {
      setShowCommitInput(false);
      setCommitMessage('');
    }
  };

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'json': 'json',
      'md': 'markdown',
      'css': 'css',
      'html': 'html',
      'yml': 'yaml',
      'yaml': 'yaml',
    };
    return map[ext || ''] || 'text';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-200">{filePath.split('/').pop()}</span>
          {isDirty && (
            <span className="text-xs text-yellow-400">● modified</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={reset}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Discard
            </button>
          )}
          
          {!showCommitInput ? (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setShowCommitInput(true)}
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                Commit
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit message..."
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white w-64"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSave(true)}
              />
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !commitMessage.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg"
              >
                {saving ? '...' : 'OK'}
              </button>
              <button
                onClick={() => { setShowCommitInput(false); setCommitMessage(''); }}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          className="w-full h-full p-4 bg-gray-950 text-gray-300 font-mono text-sm resize-none outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}