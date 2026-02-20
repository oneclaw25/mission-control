import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Brain, 
  Clock, 
  Calendar, 
  Tag, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2,
  ChevronRight,
  FolderOpen,
  Hash,
  Filter,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { useMemory, MemoryEntry, MemoryFile } from '../lib/useMemory';

const SOURCE_COLORS: Record<string, string> = {
  'SOUL.md': 'bg-purple-500/20 text-purple-400',
  'MEMORY.md': 'bg-blue-500/20 text-blue-400',
  'daily': 'bg-green-500/20 text-green-400',
  'session': 'bg-yellow-500/20 text-yellow-400',
  'HEARTBEAT.md': 'bg-orange-500/20 text-orange-400',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  decision: Brain,
  lesson: FileText,
  context: Tag,
  action: Clock,
  note: FileText,
};

export default function MemoryViewerLive() {
  const { 
    entries, 
    files, 
    isLoading, 
    error, 
    search, 
    refresh, 
    createEntry,
    updateEntry,
    totalEntries,
    totalFiles 
  } = useMemory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MemoryEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(true);
      search(searchQuery, {
        source: selectedSource || undefined,
        type: selectedType || undefined,
      }).finally(() => setIsSearching(false));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSource, selectedType, search]);

  // Extract all unique tags from entries
  const allTags = Array.from(new Set(entries.flatMap(m => m.tags || [])));
  
  // Filter by selected tag
  const filteredEntries = selectedTag
    ? entries.filter(e => e.tags?.includes(selectedTag))
    : entries;

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleCreateEntry = async (entryData: { title: string; content: string; tags: string[] }) => {
    const success = await createEntry({
      ...entryData,
      type: 'note',
    });
    if (success) {
      setShowCreateModal(false);
    }
  };

  const handleUpdateEntry = async (updates: Partial<MemoryEntry>) => {
    if (!editingEntry) return;
    const success = await updateEntry(editingEntry.id, updates);
    if (success) {
      setEditingEntry(null);
      setSelectedEntry(null);
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Memory Viewer</h2>
          <p className="text-gray-400">
            {totalEntries} entries across {totalFiles} files
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => search('')} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="flex gap-6 h-[calc(100%-100px)]">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            {isSearching && (
              <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />
            )}
          </div>

          {/* Files */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Files ({files.length})
            </h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedSource(selectedSource === file.filename ? null : file.filename)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSource === file.filename
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{file.filename}</span>
                    <span className="text-xs text-gray-600">{file.entryCount}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Tags ({allTags.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 20).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Type
            </h3>
            <div className="space-y-1">
              {['decision', 'lesson', 'action', 'note'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                    selectedType === type
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Active Filters */}
          {(selectedTag || selectedType || selectedSource) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedTag && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs flex items-center gap-1">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedType && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs flex items-center gap-1">
                  {selectedType}
                  <button onClick={() => setSelectedType(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedSource && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs flex items-center gap-1">
                  {selectedSource}
                  <button onClick={() => setSelectedSource(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Entries Grid */}
          {isLoading && filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-gray-600 animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No memories found</p>
              <p className="text-sm text-gray-600 mt-2">
                {searchQuery ? 'Try a different search term' : 'Create your first memory entry'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => {
                const Icon = TYPE_ICONS[entry.type] || FileText;
                const sourceColor = SOURCE_COLORS[entry.source] || 'bg-gray-500/20 text-gray-400';
                
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${sourceColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {entry.title || 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {entry.date}
                            <span className={`px-2 py-0.5 rounded ${sourceColor}`}>
                              {entry.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {entry.content}
                    </p>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEntryModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEntry}
        />
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && !editingEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={() => setEditingEntry(selectedEntry)}
        />
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleUpdateEntry}
        />
      )}
    </div>
  );
}

// Sub-components
function CreateEntryModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: { title: string; content: string; tags: string[] }) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !content) return;
    setIsSaving(true);
    await onSave({
      title,
      content,
      tags: tags.split(' ').filter(Boolean).map(t => t.replace('#', '')),
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto border border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Create Memory Entry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Entry title..."
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Write your memory entry..."
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-2">Tags (space separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="#important #decision"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title || !content || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

function EntryDetailModal({ entry, onClose, onEdit }: { entry: MemoryEntry; onClose: () => void; onEdit: () => void }) {
  const Icon = TYPE_ICONS[entry.type] || FileText;
  const sourceColor = SOURCE_COLORS[entry.source] || 'bg-gray-500/20 text-gray-400';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-auto border border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${sourceColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{entry.title || 'Untitled'}</h3>
              <p className="text-sm text-gray-500">{entry.source} • Line {entry.lineStart}-{entry.lineEnd}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
              <Edit3 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {entry.date}
            </span>
            <span className={`px-2 py-0.5 rounded ${sourceColor}`}>
              {entry.type}
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
              {entry.content}
            </pre>
          </div>
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditEntryModal({ entry, onClose, onSave }: { entry: MemoryEntry; onClose: () => void; onSave: (updates: Partial<MemoryEntry>) => void }) {
  const [title, setTitle] = useState(entry.title || '');
  const [content, setContent] = useState(entry.content || '');
  const [tags, setTags] = useState(entry.tags?.join(' ') || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      title,
      content,
      tags: tags.split(' ').filter(Boolean),
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto border border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Edit Memory Entry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-2">Tags (space separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Entry
          </button>
        </div>
      </div>
    </div>
  );
}
