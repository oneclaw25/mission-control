/**
 * File System utilities for Mission Control
 * Handles reading/writing tasks to memory files and watching for changes
 */

import { Task } from './openclaw';

const MEMORY_DIR = '/Users/oneclaw/workspace/memory';

export interface FileSystemTask {
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
}

// Parse tasks from markdown content
export function parseTasksFromMarkdown(content: string, sourceFile: string): FileSystemTask[] {
  const tasks: FileSystemTask[] = [];
  const lines = content.split('\n');
  let currentDate = '';
  
  for (const line of lines) {
    // Check for date headers (## YYYY-MM-DD)
    const dateMatch = line.match(/^##\s*(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      currentDate = dateMatch[1];
      continue;
    }
    
    // Check for task entries (- [ ] or - [x])
    const taskMatch = line.match(/^-\s*\[([ x])\]\s*(.+)$/);
    if (taskMatch) {
      const isDone = taskMatch[1] === 'x';
      const title = taskMatch[2].trim();
      
      // Extract priority markers
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (title.includes('!!!')) priority = 'high';
      else if (title.includes('!!')) priority = 'medium';
      else if (title.includes('!')) priority = 'low';
      
      // Clean up title
      const cleanTitle = title.replace(/!+/g, '').trim();
      
      // Extract tags
      const tags: string[] = [];
      const tagMatches = cleanTitle.match(/#(\w+)/g);
      if (tagMatches) {
        tagMatches.forEach(tag => tags.push(tag.substring(1)));
      }
      
      tasks.push({
        id: `fs-${sourceFile}-${tasks.length}`,
        title: cleanTitle.replace(/#\w+/g, '').trim(),
        assignee: 'OneClaw',
        status: isDone ? 'done' : 'todo',
        priority,
        dueDate: currentDate,
        tags,
        createdAt: currentDate || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      });
    }
  }
  
  return tasks;
}

// Convert tasks to markdown format
export function tasksToMarkdown(tasks: FileSystemTask[], date: string): string {
  const lines: string[] = [`## ${date}`, ''];
  
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  if (pendingTasks.length > 0) {
    lines.push('### Tasks', '');
    for (const task of pendingTasks) {
      const priorityMarker = task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : '!';
      const tagsStr = task.tags.length > 0 ? ' ' + task.tags.map(t => `#${t}`).join(' ') : '';
      lines.push(`- [ ] ${task.title}${priorityMarker}${tagsStr}`);
    }
    lines.push('');
  }
  
  if (completedTasks.length > 0) {
    lines.push('### Completed', '');
    for (const task of completedTasks) {
      const tagsStr = task.tags.length > 0 ? ' ' + task.tags.map(t => `#${t}`).join(' ') : '';
      lines.push(`- [x] ${task.title}${tagsStr}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

// Watch for file changes (simplified - uses polling for now)
export function watchFiles(
  pattern: string,
  callback: (files: string[]) => void,
  interval: number = 5000
): () => void {
  let lastChecked = Date.now();
  
  const check = async () => {
    try {
      // This will be called from the API route
      callback([]);
    } catch (error) {
      console.error('File watch error:', error);
    }
  };
  
  const intervalId = setInterval(check, interval);
  
  return () => {
    clearInterval(intervalId);
  };
}

// Get today's date string
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get yesterday's date string
export function getYesterdayString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}
