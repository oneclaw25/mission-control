import React, { useState } from 'react';
import { Search, FileText, Brain, Clock, Calendar, Tag } from 'lucide-react';

interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  type: 'decision' | 'lesson' | 'context' | 'action';
  source: 'SOUL.md' | 'MEMORY.md' | 'HEARTBEAT.md' | 'daily' | 'session';
}

const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: '1',
    title: 'CLARITY = Huge Priority',
    content: 'New #1 focus project. Requires immediate attention. Notion workspace being set up.',
    date: '2026-02-19',
    tags: ['priority', 'clarity', 'project'],
    type: 'decision',
    source: 'MEMORY.md',
  },
  {
    id: '2',
    title: 'Brazil = Zero Priority',
    content: 'Brazil feasibility study is research only. Sri Lanka is execution with capital deployed. Never prioritize Brazil over Sri Lanka execution.',
    date: '2026-02-19',
    tags: ['priority', 'coast-cycle', 'brazil', 'sri-lanka'],
    type: 'decision',
    source: 'MEMORY.md',
  },
  {
    id: '3',
    title: 'Telegram Response Protocol',
    content: 'Must ALWAYS respond to @oneclaw mentions and DMs. Target <2 minutes for mentions. Never ignore Telegram messages directed at me.',
    date: '2026-02-19',
    tags: ['telegram', 'protocol', 'critical'],
    type: 'action',
    source: 'HEARTBEAT.md',
  },
  {
    id: '4',
    title: 'Voice AI Recommendation',
    content: 'Use Open Source (Voicebox/Qwen3-TTS) not PolyAI. Saves $193K, you own Kent\'s voice, 100% private.',
    date: '2026-02-19',
    tags: ['voice-ai', 'recommendation', 'clarity'],
    type: 'decision',
    source: 'MEMORY.md',
  },
  {
    id: '5',
    title: '4-Core Agent System',
    content: 'Created Architect, Builder, Money Maker, Operator. Based on @tolibear_ research. Values inherit, identity does not.',
    date: '2026-02-19',
    tags: ['agents', 'architecture', 'system'],
    type: 'lesson',
    source: 'MEMORY.md',
  },
  {
    id: '6',
    title: 'Memory Flush Config',
    content: 'Enabled at 40k tokens. Saves decisions, state changes, lessons, blockers. Hybrid search 70% vector + 30% text.',
    date: '2026-02-19',
    tags: ['memory', 'config', 'technical'],
    type: 'lesson',
    source: 'MEMORY.md',
  },
];

const SOURCE_COLORS = {
  'SOUL.md': 'bg-purple-500/20 text-purple-400',
  'MEMORY.md': 'bg-blue-500/20 text-blue-400',
  'daily': 'bg-green-500/20 text-green-400',
  'session': 'bg-yellow-500/20 text-yellow-400',
  'HEARTBEAT.md': 'bg-orange-500/20 text-orange-400',
};

const TYPE_ICONS = {
  decision: Brain,
  lesson: FileText,
  context: Tag,
  action: Clock,
};

export default function MemoryViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(INITIAL_MEMORIES.flatMap(m => m.tags)));

  const filteredMemories = INITIAL_MEMORIES.filter(memory => {
    const matchesSearch = 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || memory.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Memory Viewer</h2>
          <p className="text-gray-400">Browse all memories and context</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !selectedTag ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Memory grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredMemories.map((memory) => {
          const Icon = TYPE_ICONS[memory.type];
          return (
            <div
              key={memory.id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${SOURCE_COLORS[memory.source]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{memory.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {memory.date}
                      <span className={`px-2 py-0.5 rounded ${SOURCE_COLORS[memory.source]}`}>
                        {memory.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {memory.content}
              </p>

              <div className="flex flex-wrap gap-2">
                {memory.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No memories found matching your search</p>
        </div>
      )}
    </div>
  );
}
