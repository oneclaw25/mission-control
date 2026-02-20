import React, { useState } from 'react';
import { Plus, Film, Image, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing' | 'published';
  type: 'video' | 'article' | 'social';
  notes?: string;
  script?: string;
  hasThumbnail?: boolean;
}

const STAGES = [
  { id: 'idea', label: '💡 Ideas', color: 'bg-gray-700' },
  { id: 'script', label: '📝 Script', color: 'bg-blue-600' },
  { id: 'thumbnail', label: '🎨 Thumbnail', color: 'bg-purple-600' },
  { id: 'filming', label: '🎬 Filming', color: 'bg-yellow-600' },
  { id: 'editing', label: '✂️ Editing', color: 'bg-orange-600' },
  { id: 'published', label: '🚀 Published', color: 'bg-green-600' },
];

const INITIAL_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'BossClaw Setup Tutorial',
    stage: 'script',
    type: 'video',
    script: 'Step 1: Install OpenClaw...',
    notes: 'Focus on memory optimization',
  },
  {
    id: '2',
    title: 'Voice AI Comparison',
    stage: 'idea',
    type: 'article',
    notes: 'PolyAI vs Open Source',
  },
  {
    id: '3',
    title: '4-Core Agent System',
    stage: 'thumbnail',
    type: 'video',
    hasThumbnail: true,
    notes: 'Architect, Builder, Money Maker, Operator',
  },
];

export default function ContentPipeline() {
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [newTitle, setNewTitle] = useState('');

  const addContent = () => {
    if (!newTitle.trim()) return;
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: newTitle,
      stage: 'idea',
      type: 'video',
    };
    setItems([...items, newItem]);
    setNewTitle('');
  };

  const moveStage = (id: string, direction: 'forward' | 'backward') => {
    const stageOrder = STAGES.map(s => s.id);
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const currentIndex = stageOrder.indexOf(item.stage);
      const newIndex = direction === 'forward' 
        ? Math.min(currentIndex + 1, stageOrder.length - 1)
        : Math.max(currentIndex - 1, 0);
      return { ...item, stage: stageOrder[newIndex] as ContentItem['stage'] };
    }));
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Pipeline</h2>
          <p className="text-gray-400">Manage content creation workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New content idea..."
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addContent()}
          />
          <button
            onClick={addContent}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Idea
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {STAGES.map((stage) => (
          <div key={stage.id} className="bg-gray-900 rounded-xl border border-gray-800">
            <div className={`px-3 py-2 ${stage.color} rounded-t-xl`}>
              <h3 className="font-medium text-white text-sm">{stage.label}</h3>
              <p className="text-xs text-white/70">
                {items.filter(i => i.stage === stage.id).length} items
              </p>
            </div>
            <div className="p-3 space-y-3">
              {items
                .filter((item) => item.stage === stage.id)
                .map((item) => (
                  <ContentCard key={item.id} item={item} onMove={moveStage} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentCard({ item, onMove }: { item: ContentItem; onMove: (id: string, dir: 'forward' | 'backward') => void }) {
  const typeIcons = {
    video: Film,
    article: FileText,
    social: Image,
  };

  const TypeIcon = typeIcons[item.type];

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-start gap-2 mb-2">
        <TypeIcon className="w-4 h-4 text-gray-400 mt-0.5" />
        <h4 className="text-sm font-medium text-gray-200 flex-1">{item.title}</h4>
      </div>
      
      {item.notes && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.notes}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        {item.script && (
          <span className="flex items-center gap-1 text-xs text-blue-400">
            <FileText className="w-3 h-3" />
            Script
          </span>
        )}
        {item.hasThumbnail && (
          <span className="flex items-center gap-1 text-xs text-purple-400">
            <Image className="w-3 h-3" />
            Thumbnail
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onMove(item.id, 'backward')}
          className="flex-1 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => onMove(item.id, 'forward')}
          className="flex-1 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
