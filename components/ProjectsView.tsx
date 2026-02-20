import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Settings, 
  Users, 
  CheckCircle2,
  Clock,
  MoreVertical,
  Filter
} from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgents: string[];
  defaultModel: string;
  createdAt: string;
  taskCount: number;
  lastActive: string;
}

const INITIAL_PROJECTS: Project[] = [
  { 
    id: '1', 
    name: 'Clarity', 
    description: 'Voice AI for property inspections - HUGE PRIORITY',
    status: 'active',
    priority: 'critical',
    assignedAgents: ['OneClaw', 'BossClaw', 'Builder'],
    defaultModel: 'anthropic/claude-sonnet-4',
    createdAt: '2026-02-15',
    taskCount: 12,
    lastActive: 'Just now'
  },
  { 
    id: '2', 
    name: 'Coast Cycle Sri Lanka', 
    description: 'BOI proposal and local expansion execution',
    status: 'active',
    priority: 'high',
    assignedAgents: ['OneClaw', 'Money Maker'],
    defaultModel: 'moonshot/kimi-k2.5',
    createdAt: '2026-02-10',
    taskCount: 8,
    lastActive: '2 hours ago'
  },
  { 
    id: '3', 
    name: 'Fix AI', 
    description: 'B2B device inspection platform - research complete',
    status: 'active',
    priority: 'high',
    assignedAgents: ['OneClaw', 'Architect'],
    defaultModel: 'anthropic/claude-sonnet-4-6',
    createdAt: '2026-02-20',
    taskCount: 5,
    lastActive: 'Just now'
  },
  { 
    id: '4', 
    name: 'Taste', 
    description: 'Contributions and support as needed',
    status: 'paused',
    priority: 'medium',
    assignedAgents: ['OneClaw'],
    defaultModel: 'moonshot/kimi-k2.5',
    createdAt: '2026-02-01',
    taskCount: 3,
    lastActive: '3 days ago'
  },
  { 
    id: '5', 
    name: 'Arkim', 
    description: 'Contributions and support as needed',
    status: 'active',
    priority: 'medium',
    assignedAgents: ['OneClaw', 'Operator'],
    defaultModel: 'moonshot/kimi-k2.5',
    createdAt: '2026-02-05',
    taskCount: 4,
    lastActive: '1 day ago'
  },
];

const AVAILABLE_AGENTS = [
  { id: 'OneClaw', name: 'OneClaw', role: 'Primary Cloud', icon: '☁️' },
  { id: 'BossClaw', name: 'BossClaw', role: 'Local Mac Studio', icon: '🖥️' },
  { id: 'Architect', name: 'Architect', role: 'Strategy', icon: '🏗️' },
  { id: 'Builder', name: 'Builder', role: 'Product', icon: '🔨' },
  { id: 'Money Maker', name: 'Money Maker', role: 'Business', icon: '💰' },
  { id: 'Operator', name: 'Operator', role: 'Operations', icon: '⚙️' },
];

const AVAILABLE_MODELS = [
  { id: 'moonshot/kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot', speed: 'Fast', quality: 'High' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', speed: 'Medium', quality: 'Excellent' },
  { id: 'anthropic/claude-sonnet-4-6', name: 'Claude 4.6', provider: 'Anthropic', speed: 'Medium', quality: 'Excellent' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', speed: 'Fast', quality: 'High' },
  { id: 'gemini/gemini-2-flash', name: 'Gemini Flash', provider: 'Google', speed: 'Very Fast', quality: 'Good' },
];

interface ProjectsViewProps {
  onProjectSelect?: (project: Project) => void;
  selectedProjectId?: string;
}

export default function ProjectsView({ onProjectSelect, selectedProjectId }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  const filteredProjects = projects.filter(p => 
    filter === 'all' ? true : p.status === filter
  );

  const addProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      status: 'active',
      priority: 'medium',
      assignedAgents: ['OneClaw'],
      defaultModel: 'moonshot/kimi-k2.5',
      createdAt: new Date().toISOString().split('T')[0],
      taskCount: 0,
      lastActive: 'Just created'
    };
    setProjects([...projects, newProject]);
    setShowNewProject(false);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
    setEditingProject(null);
  };

  const toggleAgent = (projectId: string, agentId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newAgents = project.assignedAgents.includes(agentId)
      ? project.assignedAgents.filter(a => a !== agentId)
      : [...project.assignedAgents, agentId];
    
    updateProject(projectId, { assignedAgents: newAgents });
  };

  const setProjectModel = (projectId: string, modelId: string) => {
    updateProject(projectId, { defaultModel: modelId });
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-gray-400">Manage all your workstreams</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            {(['all', 'active', 'paused'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {showNewProject && (
        <NewProjectForm 
          onSubmit={addProject} 
          onCancel={() => setShowNewProject(false)} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            isEditing={editingProject === project.id}
            onSelect={() => onProjectSelect?.(project)}
            onEdit={() => setEditingProject(project.id)}
            onSave={(updates) => updateProject(project.id, updates)}
            onCancelEdit={() => setEditingProject(null)}
            onToggleAgent={(agentId) => toggleAgent(project.id, agentId)}
            onSetModel={(modelId) => setProjectModel(project.id, modelId)}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ 
  project, 
  isSelected, 
  isEditing,
  onSelect, 
  onEdit, 
  onSave,
  onCancelEdit,
  onToggleAgent,
  onSetModel
}: { 
  project: Project; 
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onSave: (updates: Partial<Project>) => void;
  onCancelEdit: () => void;
  onToggleAgent: (agentId: string) => void;
  onSetModel: (modelId: string) => void;
}) {
  const [editForm, setEditForm] = useState(project);

  const priorityColors = {
    low: 'bg-gray-600',
    medium: 'bg-blue-600',
    high: 'bg-orange-600',
    critical: 'bg-red-600',
  };

  const statusColors = {
    active: 'text-green-400',
    paused: 'text-yellow-400',
    completed: 'text-gray-400',
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === project.defaultModel);

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border-2 border-blue-500">
        <h3 className="text-lg font-semibold text-white mb-4">Edit Project</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 outline-none h-20"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Assigned Agents</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => onToggleAgent(agent.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    editForm.assignedAgents.includes(agent.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {agent.icon} {agent.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Default Model</label>
            <select
              value={editForm.defaultModel}
              onChange={(e) => setEditForm({ ...editForm, defaultModel: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider}) - {model.quality}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onSave(editForm)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className={`bg-gray-900 rounded-xl p-6 border cursor-pointer transition-all hover:border-gray-600 ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${priorityColors[project.priority]}`}>
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
            <p className={`text-xs ${statusColors[project.status]} capitalize`}>
              {project.status} • {project.lastActive}
            </p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <div className="flex -space-x-2">
            {project.assignedAgents.slice(0, 4).map((agentId, i) => {
              const agent = AVAILABLE_AGENTS.find(a => a.id === agentId);
              return (
                <div 
                  key={agentId}
                  className="w-6 h-6 rounded-full bg-gray-700 border border-gray-900 flex items-center justify-center text-xs"
                  title={agent?.name}
                >
                  {agent?.icon}
                </div>
              );
            })}
            {project.assignedAgents.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-900 flex items-center justify-center text-xs text-gray-400">
                +{project.assignedAgents.length - 4}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">{project.taskCount} tasks</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
            🤖
          </div>
          <span className="text-sm text-gray-400">{selectedModel?.name || project.defaultModel}</span>
        </div>
      </div>
    </div>
  );
}

function NewProjectForm({ onSubmit, onCancel }: { onSubmit: (name: string, description: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name..."
          className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description..."
          className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 outline-none h-20"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSubmit(name, description)}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Create
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
