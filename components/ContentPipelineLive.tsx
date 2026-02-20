import React, { useState, useEffect } from 'react';
import {
  Plus,
  Film,
  Image,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Tag,
  MoreHorizontal,
  Save,
  X,
  GitBranch,
  GitCommit,
  Bot,
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'article' | 'social';
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing' | 'published';
  notes: string;
  script: string;
  hasThumbnail: boolean;
  thumbnailUrl: string | null;
  dueDate: string | null;
  assignedTo: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  history: Array<{
    from?: string;
    to?: string;
    stage?: string;
    timestamp: string;
    action: string;
    notes?: string;
  }>;
}

const STAGES = [
  { id: 'idea', label: '💡 Ideas', color: 'bg-gray-700', borderColor: 'border-gray-600' },
  { id: 'script', label: '📝 Script', color: 'bg-blue-600', borderColor: 'border-blue-500' },
  { id: 'thumbnail', label: '🎨 Thumbnail', color: 'bg-purple-600', borderColor: 'border-purple-500' },
  { id: 'filming', label: '🎬 Filming', color: 'bg-yellow-600', borderColor: 'border-yellow-500' },
  { id: 'editing', label: '✂️ Editing', color: 'bg-orange-600', borderColor: 'border-orange-500' },
  { id: 'published', label: '🚀 Published', color: 'bg-green-600', borderColor: 'border-green-500' },
] as const;

const AGENTS = [
  { id: 'OneClaw', name: 'OneClaw', icon: '☁️', role: 'Primary' },
  { id: 'BossClaw', name: 'BossClaw', icon: '🖥️', role: 'Secondary' },
  { id: 'Architect', name: 'Architect', icon: '🏗️', role: 'Strategy' },
  { id: 'Builder', name: 'Builder', icon: '🔨', role: 'Product' },
  { id: 'Money Maker', name: 'Money Maker', icon: '💰', role: 'Business' },
  { id: 'Operator', name: 'Operator', icon: '⚙️', role: 'Operations' },
];

export default function ContentPipelineLive() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Fetch content items
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      setItems(data.items || []);
    } catch (e) {
      console.error('Failed to fetch content:', e);
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (title: string, type: 'video' | 'article' | 'social') => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type }),
      });
      const newItem = await response.json();
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (e) {
      console.error('Failed to create content:', e);
    }
  };

  const updateStage = async (id: string, newStage: ContentItem['stage'], notes?: string) => {
    try {
      const response = await fetch(`/api/content?id=${id}&action=stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage, notes }),
      });
      const updated = await response.json();
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      
      // Update selected item if open
      if (selectedItem?.id === id) {
        setSelectedItem(updated);
      }
      
      return updated;
    } catch (e) {
      console.error('Failed to update stage:', e);
    }
  };

  const assignToAgent = async (id: string, agentId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/content?id=${id}&action=assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: agentId, notes }),
      });
      const updated = await response.json();
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      if (selectedItem?.id === id) {
        setSelectedItem(updated);
      }
      return updated;
    } catch (e) {
      console.error('Failed to assign:', e);
    }
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await response.json();
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      if (selectedItem?.id === id) {
        setSelectedItem(updated);
      }
      return updated;
    } catch (e) {
      console.error('Failed to update content:', e);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (e) {
      console.error('Failed to delete content:', e);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggingItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggingItem) {
      const item = items.find(i => i.id === draggingItem);
      if (item && item.stage !== stageId) {
        await updateStage(draggingItem, stageId as ContentItem['stage'], `Moved from ${item.stage} to ${stageId}`);
      }
      setDraggingItem(null);
    }
  };

  const moveStage = async (itemId: string, direction: 'forward' | 'backward') => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const stageOrder = STAGES.map(s => s.id);
    const currentIndex = stageOrder.indexOf(item.stage);
    const newIndex = direction === 'forward' 
      ? Math.min(currentIndex + 1, stageOrder.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    if (newIndex !== currentIndex) {
      await updateStage(itemId, stageOrder[newIndex] as ContentItem['stage']);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Pipeline</h2>
          <p className="text-gray-400">Manage content creation workflow</p>
        </div>
        <button
          onClick={() => setShowNewItem(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Content
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`w-72 flex flex-col bg-gray-900 rounded-xl border-2 transition-colors ${
                dragOverStage === stage.id ? 'border-blue-500 bg-blue-900/20' : stage.borderColor
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
            >
              <div className={`${stage.color} rounded-t-xl px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{stage.label}</h3>
                  <span className="bg-black/30 px-2 py-0.5 rounded-full text-sm">
                    {items.filter(i => i.stage === stage.id).length}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {items
                  .filter((item) => item.stage === stage.id)
                  .map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedItem(item)}
                      onMove={moveStage}
                      onDragStart={handleDragStart}
                      isDragging={draggingItem === item.id}
                    />
                  ))}
                {items.filter(i => i.stage === stage.id).length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-sm">
                    Drop items here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Item Modal */}
      {showNewItem && (
        <NewItemModal
          onClose={() => setShowNewItem(false)}
          onCreate={createContent}
        />
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <ContentDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={(updates) => updateContent(selectedItem.id, updates)}
          onStageChange={(stage) => updateStage(selectedItem.id, stage)}
          onAssign={(agentId) => assignToAgent(selectedItem.id, agentId)}
          onDelete={() => deleteContent(selectedItem.id)}
        />
      )}
    </div>
  );
}

function ContentCard({
  item,
  onClick,
  onMove,
  onDragStart,
  isDragging,
}: {
  item: ContentItem;
  onClick: () => void;
  onMove: (id: string, dir: 'forward' | 'backward') => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
}) {
  const typeIcons = {
    video: Film,
    article: FileText,
    social: Image,
  };

  const TypeIcon = typeIcons[item.type];
  const assignedAgent = AGENTS.find(a => a.id === item.assignedTo);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={onClick}
      className={`bg-gray-800 rounded-lg p-3 border border-gray-700 cursor-move transition-all hover:border-gray-600 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <TypeIcon className="w-4 h-4 text-gray-400 mt-0.5" />
        <h4 className="text-sm font-medium text-gray-200 flex-1 line-clamp-2">{item.title}</h4>
      </div>

      {item.notes && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.notes}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.hasThumbnail && (
            <span className="text-xs text-purple-400">
              <Image className="w-3 h-3 inline mr-1" />
            </span>
          )}
          {item.script && (
            <span className="text-xs text-blue-400">
              <FileText className="w-3 h-3 inline mr-1" />
            </span>
          )}
        </div>
        
        {assignedAgent && (
          <span className="text-xs" title={assignedAgent.name}>
            {assignedAgent.icon}
          </span>
        )}
      </div>

      {item.dueDate && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {new Date(item.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

function NewItemModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, type: 'video' | 'article' | 'social') => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'article' | 'social'>('video');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setCreating(true);
    await onCreate(title, type);
    setCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">Create New Content</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are we creating?"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Type</label>
            <div className="flex gap-2">
              {(['video', 'article', 'social'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                    type === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || creating}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentDetailModal({
  item,
  onClose,
  onUpdate,
  onStageChange,
  onAssign,
  onDelete,
}: {
  item: ContentItem;
  onClose: () => void;
  onUpdate: (updates: Partial<ContentItem>) => void;
  onStageChange: (stage: ContentItem['stage']) => void;
  onAssign: (agentId: string) => void;
  onDelete: () => void;
}) {
  const [editForm, setEditForm] = useState(item);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'script' | 'history'>('details');

  const handleSave = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  const typeIcons = {
    video: Film,
    article: FileText,
    social: Image,
  };

  const TypeIcon = typeIcons[item.type];
  const currentStage = STAGES.find(s => s.id === item.stage);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${currentStage?.color}`}>
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-gray-500">Created {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stage Progress */}
        <div className="px-6 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {STAGES.map((stage, i) => {
              const isActive = stage.id === item.stage;
              const isPast = STAGES.findIndex(s => s.id === item.stage) > i;
              
              return (
                <button
                  key={stage.id}
                  onClick={() => onStageChange(stage.id)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isActive ? 'text-blue-400' : isPast ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isActive ? 'bg-blue-600 text-white' :
                    isPast ? 'bg-green-600 text-white' :
                    'bg-gray-800'
                  }`}>
                    {isPast ? '✓' : stage.label[0]}
                  </div>
                  <span className="text-xs">{stage.label.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 border-b border-gray-800">
          {(['details', 'script', 'history'] as const).map((tab) => (
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-24"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Assigned To</label>
                    <div className="flex flex-wrap gap-2">
                      {AGENTS.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => onAssign(agent.id)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            item.assignedTo === agent.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {agent.icon} {agent.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editForm.dueDate?.split('T')[0] || ''}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Type</label>
                      <p className="text-gray-300 capitalize">{item.type}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Current Stage</label>
                      <p className="text-gray-300">{currentStage?.label}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Assigned To</label>
                      <p className="text-gray-300">
                        {item.assignedTo ? AGENTS.find(a => a.id === item.assignedTo)?.icon + ' ' + item.assignedTo : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Due Date</label>
                      <p className="text-gray-300">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Notes</label>
                    <p className="text-gray-300 bg-gray-800 p-3 rounded-lg">
                      {item.notes || 'No notes'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-4">
              <textarea
                value={editForm.script}
                onChange={(e) => setEditForm({ ...editForm, script: e.target.value })}
                placeholder="Write your script here..."
                className="w-full h-64 px-4 py-3 bg-gray-950 text-gray-300 font-mono text-sm rounded-lg resize-none"
              />
              <button
                onClick={() => onUpdate({ script: editForm.script })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save Script
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {item.history?.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="mt-0.5">
                    {entry.action === 'created' && <Plus className="w-4 h-4 text-green-400" />}
                    {entry.action === 'stage_change' && <GitBranch className="w-4 h-4 text-blue-400" />}
                    {entry.action === 'assigned' && <Bot className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">
                      {entry.action === 'created' && 'Content created'}
                      {entry.action === 'stage_change' && `Moved from ${entry.from} to ${entry.to}`}
                      {entry.action === 'assigned' && `Assigned to ${entry.to}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-gray-400 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              )) || <p className="text-gray-500">No history yet</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
          >
            Delete
          </button>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}