/**
 * Live Tasks Board Component
 * Tasks board connected to file system with real-time updates
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  User, 
  FolderKanban,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useTasks } from '../hooks/useOpenClaw';
import { useWebSocket } from '../lib/websocket';
import { format } from 'date-fns';

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
  tags: string[];
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
  source: 'memory' | 'session' | 'manual';
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-700' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-600' },
  { id: 'review', label: 'Review', color: 'bg-yellow-600' },
  { id: 'done', label: 'Done', color: 'bg-green-600' },
];

const ASSIGNEES = [
  { id: 'me', name: 'You', icon: '👤' },
  { id: 'OneClaw', name: 'OneClaw', icon: '☁️' },
  { id: 'BossClaw', name: 'BossClaw', icon: '🖥️' },
  { id: 'Architect', name: 'Architect', icon: '🏗️' },
  { id: 'Builder', name: 'Builder', icon: '🔨' },
  { id: 'Money Maker', name: 'Money Maker', icon: '💰' },
  { id: 'Operator', name: 'Operator', icon: '⚙️' },
];

const PROJECTS = [
  { id: '1', name: 'Clarity' },
  { id: '2', name: 'Coast Cycle Sri Lanka' },
  { id: '3', name: 'Fix AI' },
  { id: '4', name: 'Taste' },
  { id: '5', name: 'Arkim' },
];

interface TasksBoardLiveProps {
  projectId?: string;
}

function TaskCard({ 
  task, 
  onMove, 
  onUpdate,
  showProject
}: { 
  task: Task; 
  onMove: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  showProject?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const priorityColors = {
    low: 'bg-gray-600',
    medium: 'bg-yellow-600',
    high: 'bg-red-600',
  };

  const assignee = ASSIGNEES.find(a => a.id === task.assignee) || ASSIGNEES[0];
  const project = PROJECTS.find(p => p.id === task.projectId);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-move hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-200 flex-1 pr-2">{task.title}</h4>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      {showProject && project && (
        <div className="flex items-center gap-1 mb-2">
          <FolderKanban className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-blue-400">{project.name}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span>{assignee.icon}</span>
          {assignee.name}
        </span>
        {task.estimatedHours && (
          <span className="text-xs text-gray-500">
            {task.estimatedHours}h
          </span>
        )}
      </div>

      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Calendar className="w-3 h-3" />
          Due {format(new Date(task.dueDate), 'MMM d')}
        </div>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-1 pt-2 border-t border-gray-700">
        {COLUMNS.filter(col => col.id !== task.status).slice(0, 2).map(col => (
          <button
            key={col.id}
            onClick={() => onMove(task.id, col.id)}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          >
            → {col.label}
          </button>
        ))}
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
          <p className="text-xs text-gray-500">Change Assignee:</p>
          <div className="flex flex-wrap gap-1">
            {ASSIGNEES.map(a => (
              <button
                key={a.id}
                onClick={() => onUpdate(task.id, { assignee: a.id })}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  task.assignee === a.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {a.icon} {a.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ 
  column, 
  tasks, 
  onMove, 
  onUpdate,
  showProject,
  onDrop
}: { 
  column: typeof COLUMNS[0]; 
  tasks: Task[]; 
  onMove: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  showProject?: boolean;
  onDrop: (taskId: string, status: TaskStatus) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, column.id);
    }
  };

  return (
    <div 
      className={`bg-gray-900 rounded-xl border border-gray-800 flex flex-col transition-colors ${
        isDragOver ? 'border-blue-500 bg-blue-900/10' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`px-4 py-3 ${column.color} rounded-t-xl`}>
        <h3 className="font-semibold text-white">{column.label}</h3>
        <p className="text-xs text-white/70">
          {tasks.length} tasks
        </p>
      </div>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onMove={onMove}
            onUpdate={onUpdate}
            showProject={showProject}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksBoardLive({ projectId }: TasksBoardLiveProps) {
  const [filter, setFilter] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('OneClaw');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [successMessage, setSuccessMessage] = useState('');

  const { tasks, loading, error, updateTask, createTask, refetch } = useTasks(30000);

  // Listen for real-time updates
  useWebSocket('task.updated', () => {
    refetch();
  });

  // Filter tasks by project and search
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (projectId) {
      filtered = filtered.filter(t => t.projectId === projectId);
    }
    
    if (filter) {
      const searchLower = filter.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        t.assignee.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [tasks, projectId, filter]);

  const handleMoveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setSuccessMessage(`Task moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  }, [updateTask]);

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }, [updateTask]);

  const handleCreateTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      await createTask({
        title: newTaskTitle,
        assignee: newTaskAssignee,
        status: 'todo',
        priority: newTaskPriority,
        projectId,
        tags: [],
        source: 'manual',
      });
      
      setNewTaskTitle('');
      setShowNewTaskForm(false);
      setSuccessMessage('Task created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  }, [newTaskTitle, newTaskAssignee, newTaskPriority, projectId, createTask]);

  const projectName = projectId ? PROJECTS.find(p => p.id === projectId)?.name : null;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load tasks</p>
          <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-blue-400" />
              Tasks Board
            </h2>
            {projectName && (
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                {projectName}
              </span>
            )}
          </div>
          <p className="text-gray-400 mt-1">
            {projectId ? `Track tasks for ${projectName}` : 'Track all tasks across projects'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search tasks..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Add Task Button */}
          {!showNewTaskForm ? (
            <button
              onClick={() => setShowNewTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          ) : (
            <button
              onClick={() => setShowNewTaskForm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Create New Task</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="flex-1 min-w-[200px] px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
            >
              {ASSIGNEES.map(a => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && tasks.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={filteredTasks.filter(t => t.status === column.id)}
            onMove={handleMoveTask}
            onUpdate={handleUpdateTask}
            showProject={!projectId}
            onDrop={handleMoveTask}
          />
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
        <span>Total: {filteredTasks.length} tasks</span>
        <span>Completed: {filteredTasks.filter(t => t.status === 'done').length}</span>
        <span>In Progress: {filteredTasks.filter(t => t.status === 'in-progress').length}</span>
        <span className="ml-auto">
          Last updated: {format(new Date(), 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
