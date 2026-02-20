/**
 * Tasks API - List and Create Tasks
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const MEMORY_DIR = '/Users/oneclaw/workspace/memory';
const TASKS_FILE = path.join(MEMORY_DIR, 'tasks.json');

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  tags: string[];
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
  source: 'memory' | 'session' | 'manual';
}

// Ensure memory directory exists
function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

// Read tasks from file
function readTasks(): Task[] {
  ensureMemoryDir();
  
  if (!fs.existsSync(TASKS_FILE)) {
    // Return default tasks
    return getDefaultTasks();
  }
  
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read tasks:', error);
    return getDefaultTasks();
  }
}

// Write tasks to file
function writeTasks(tasks: Task[]) {
  ensureMemoryDir();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Get default tasks
function getDefaultTasks(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    {
      id: '1',
      title: 'Set up Voicebox on Mac Studio',
      assignee: 'BossClaw',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-02-22',
      projectId: '1',
      tags: ['voice', 'mac-studio'],
      estimatedHours: 4,
      createdAt: today,
      updatedAt: today,
      source: 'manual',
    },
    {
      id: '2',
      title: 'Record Kent\'s voice samples',
      assignee: 'me',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-02-23',
      projectId: '1',
      tags: ['voice', 'data'],
      estimatedHours: 2,
      createdAt: today,
      updatedAt: today,
      source: 'manual',
    },
    {
      id: '3',
      title: 'Train first voice model',
      assignee: 'Builder',
      status: 'in-progress',
      priority: 'high',
      projectId: '1',
      tags: ['ml', 'voice'],
      estimatedHours: 8,
      createdAt: today,
      updatedAt: today,
      source: 'manual',
    },
    {
      id: '4',
      title: 'Finalize BOI proposal',
      assignee: 'Money Maker',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2026-02-25',
      projectId: '2',
      tags: ['bureaucracy', 'legal'],
      estimatedHours: 6,
      createdAt: today,
      updatedAt: today,
      source: 'manual',
    },
    {
      id: '5',
      title: 'Build crack detection MVP',
      assignee: 'Builder',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-03-15',
      projectId: '3',
      tags: ['ml', 'cv'],
      estimatedHours: 40,
      createdAt: today,
      updatedAt: today,
      source: 'manual',
    },
    {
      id: '6',
      title: 'Update Mission Control dashboard',
      assignee: 'OneClaw',
      status: 'done',
      priority: 'high',
      tags: ['internal'],
      estimatedHours: 4,
      createdAt: today,
      updatedAt: today,
      source: 'manual',
    },
  ];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tasks = readTasks();
    return res.status(200).json(tasks);
  }
  
  if (req.method === 'POST') {
    const tasks = readTasks();
    const newTask: Task = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    writeTasks(tasks);
    
    return res.status(201).json(newTask);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
