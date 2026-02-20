import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Calendar, Clock, User, FolderKanban } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  tags: string[];
  estimatedHours?: number;
}

const COLUMNS = [
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

// Tasks organized by project
const PROJECT_TASKS: Record<string, Task[]> = {
  '1': [ // Clarity
    { id: 'c1', title: 'Set up Voicebox on Mac Studio', assignee: 'BossClaw', status: 'todo', priority: 'high', dueDate: '2026-02-22', projectId: '1', tags: ['voice', 'mac-studio'], estimatedHours: 4 },
    { id: 'c2', title: 'Record Kent\'s voice samples', assignee: 'me', status: 'todo', priority: 'high', dueDate: '2026-02-23', projectId: '1', tags: ['voice', 'data'], estimatedHours: 2 },
    { id: 'c3', title: 'Train first voice model', assignee: 'Builder', status: 'in-progress', priority: 'high', projectId: '1', tags: ['ml', 'voice'], estimatedHours: 8 },
    { id: 'c4', title: 'Integrate with Notion workspace', assignee: 'OneClaw', status: 'todo', priority: 'medium', projectId: '1', tags: ['integration'], estimatedHours: 4 },
  ],
  '2': [ // Coast Cycle Sri Lanka
    { id: 's1', title: 'Finalize BOI proposal', assignee: 'Money Maker', status: 'in-progress', priority: 'high', dueDate: '2026-02-25', projectId: '2', tags: ['bureaucracy', 'legal'], estimatedHours: 6 },
    { id: 's2', title: 'Contact Sampath Bank', assignee: 'Operator', status: 'todo', priority: 'high', projectId: '2', tags: ['finance'], estimatedHours: 2 },
    { id: 's3', title: 'Review land lease agreements', assignee: 'Architect', status: 'todo', priority: 'medium', projectId: '2', tags: ['legal'], estimatedHours: 4 },
  ],
  '3': [ // Fix AI
    { id: 'f1', title: 'Build crack detection MVP', assignee: 'Builder', status: 'todo', priority: 'high', dueDate: '2026-03-15', projectId: '3', tags: ['ml', 'cv'], estimatedHours: 40 },
    { id: 'f2', title: 'Recruit pilot customers', assignee: 'Money Maker', status: 'todo', priority: 'high', projectId: '3', tags: ['sales'], estimatedHours: 10 },
    { id: 'f3', title: 'Collect training data', assignee: 'Operator', status: 'in-progress', priority: 'high', projectId: '3', tags: ['data'], estimatedHours: 20 },
    { id: 'f4', title: 'Build inspection dashboard', assignee: 'Builder', status: 'todo', priority: 'medium', projectId: '3', tags: ['frontend'], estimatedHours: 16 },
  ],
  '4': [ // Taste
    { id: 't1', title: 'Process info dump from user', assignee: 'OneClaw', status: 'todo', priority: 'medium', projectId: '4', tags: ['documentation'], estimatedHours: 3 },
  ],
  '5': [ // Arkim
    { id: 'a1', title: 'Process info dump from user', assignee: 'OneClaw', status: 'todo', priority: 'medium', projectId: '5', tags: ['documentation'], estimatedHours: 3 },
  ],
};

const GENERAL_TASKS: Task[] = [
  { id: 'g1', title: 'Update Mission Control dashboard', assignee: 'OneClaw', status: 'done', priority: 'high', projectId: undefined, tags: ['internal'], estimatedHours: 4 },
  { id: 'g2', title: 'Create Fix AI B2B research', assignee: 'OneClaw', status: 'done', priority: 'high', projectId: undefined, tags: ['research'], estimatedHours: 6 },
  { id: 'g3', title: 'Send documents to jacob@arkim.ai', assignee: 'OneClaw', status: 'done', priority: 'high', projectId: undefined, tags: ['communication'], estimatedHours: 1 },
];

interface TasksBoardProps {
  projectId?: string;
}

export default function TasksBoard({ projectId }: TasksBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('OneClaw');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  useEffect(() => {
    if (projectId && PROJECT_TASKS[projectId]) {
      setTasks(PROJECT_TASKS[projectId]);
    } else {
      // Show general tasks + all project tasks
      const allTasks = [...GENERAL_TASKS];
      Object.values(PROJECT_TASKS).forEach(projectTasks => {
        allTasks.push(...projectTasks);
      });
      setTasks(allTasks);
    }
  }, [projectId]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assignee: newTaskAssignee,
      status: 'todo',
      priority: newTaskPriority,
      projectId: projectId,
      tags: [],
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowNewTaskForm(false);
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const getProjectName = (pid?: string) => {
    const names: Record<string, string> = {
      '1': 'Clarity',
      '2': 'Coast Cycle',
      '3': 'Fix AI',
      '4': 'Taste',
      '5': 'Arkim',
    };
    return pid ? names[pid] || 'Unknown' : 'General';
  };

  const projectName = projectId ? getProjectName(projectId) : 'All Projects';

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Tasks Board</h2>
            {projectId && (
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                {projectName}
              </span>
            )}
          </div>
          <p className="text-gray-400">
            {projectId ? `Track tasks for ${projectName}` : 'Track all tasks across projects'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!showNewTaskForm ? (
            <button
              onClick={() => setShowNewTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="px-3 py-1 bg-gray-700 rounded text-white placeholder-gray-500 outline-none w-64"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="px-3 py-1 bg-gray-700 rounded text-white text-sm"
              >
                {ASSIGNEES.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                ))}
              </select>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                className="px-3 py-1 bg-gray-700 rounded text-white text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <div key={column.id} className="bg-gray-900 rounded-xl border border-gray-800">
            <div className={`px-4 py-3 ${column.color} rounded-t-xl`}>
              <h3 className="font-semibold text-white">{column.label}</h3>
              <p className="text-xs text-white/70">
                {tasks.filter(t => t.status === column.id).length} tasks
              </p>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {tasks
                .filter((task) => task.status === column.id)
                .map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onMove={moveTask}
                    showProject={!projectId}
                    projectName={getProjectName(task.projectId)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ 
  task, 
  onMove, 
  showProject,
  projectName 
}: { 
  task: Task; 
  onMove: (id: string, status: Task['status']) => void;
  showProject?: boolean;
  projectName?: string;
}) {
  const priorityColors = {
    low: 'bg-gray-600',
    medium: 'bg-yellow-600',
    high: 'bg-red-600',
  };

  const assignee = ASSIGNEES.find(a => a.id === task.assignee) || ASSIGNEES[0];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-200">{task.title}</h4>
        <button className="text-gray-500 hover:text-gray-300">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      {showProject && projectName && (
        <div className="flex items-center gap-1 mb-2">
          <FolderKanban className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-blue-400">{projectName}</span>
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
          Due {task.dueDate}
        </div>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1">
        {COLUMNS.filter(col => col.id !== task.status).map(col => (
          <button
            key={col.id}
            onClick={() => onMove(task.id, col.id as Task['status'])}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          >
            → {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}
