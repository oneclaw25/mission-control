/**
 * Individual Task API - Update and Delete
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

function readTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read tasks:', error);
    return [];
  }
}

function writeTasks(tasks: Task[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Task ID is required' });
  }
  
  if (req.method === 'GET') {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.status(200).json(task);
  }
  
  if (req.method === 'PATCH') {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...req.body,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    writeTasks(tasks);
    
    return res.status(200).json(updatedTask);
  }
  
  if (req.method === 'DELETE') {
    const tasks = readTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    writeTasks(filteredTasks);
    return res.status(204).end();
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
