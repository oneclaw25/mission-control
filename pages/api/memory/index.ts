import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const MEMORY_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'memory');

interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  type: 'decision' | 'lesson' | 'context' | 'action' | 'note';
  source: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
}

// Parse markdown file into entries
async function parseMemoryFile(filePath: string): Promise<MemoryEntry[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const entries: MemoryEntry[] = [];
    let currentEntry: Partial<MemoryEntry> | null = null;
    let lineStart = 0;
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for date header pattern: ## YYYY-MM-DD
      const dateMatch = line.match(/^##\s*(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        // Save previous entry if exists
        if (currentEntry && contentLines.length > 0) {
          entries.push({
            ...currentEntry as MemoryEntry,
            content: contentLines.join('\n').trim(),
            lineEnd: i - 1,
          });
        }
        
        // Start new entry
        currentEntry = {
          id: `${path.basename(filePath)}-${i}`,
          date: dateMatch[1],
          filePath,
          lineStart: i,
          source: path.basename(filePath),
        };
        contentLines = [];
        continue;
      }
      
      // Check for entry title pattern: **Title** or ### Title
      const titleMatch = line.match(/^(?:\*\*|###)\s*(.+?)(?:\*\*)?$/);
      if (titleMatch && currentEntry) {
        currentEntry.title = titleMatch[1].trim();
        continue;
      }
      
      // Check for tags pattern: #tag1 #tag2
      const tagMatch = line.match(/#([\w-]+)/g);
      if (tagMatch && currentEntry) {
        currentEntry.tags = tagMatch.map(t => t.slice(1));
      }
      
      // Detect type from content
      if (currentEntry) {
        if (line.toLowerCase().includes('decision')) currentEntry.type = 'decision';
        else if (line.toLowerCase().includes('lesson')) currentEntry.type = 'lesson';
        else if (line.toLowerCase().includes('action')) currentEntry.type = 'action';
        else if (!currentEntry.type) currentEntry.type = 'note';
        
        contentLines.push(line);
      }
    }
    
    // Save last entry
    if (currentEntry && contentLines.length > 0) {
      entries.push({
        ...currentEntry as MemoryEntry,
        content: contentLines.join('\n').trim(),
        lineEnd: lines.length - 1,
      });
    }
    
    return entries;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { q, source, date, type } = req.query;
        
        // Ensure memory directory exists
        try {
          await fs.access(MEMORY_DIR);
        } catch {
          await fs.mkdir(MEMORY_DIR, { recursive: true });
        }
        
        // Read all memory files
        const files = await fs.readdir(MEMORY_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        
        let allEntries: MemoryEntry[] = [];
        
        for (const file of mdFiles) {
          const filePath = path.join(MEMORY_DIR, file);
          const entries = await parseMemoryFile(filePath);
          allEntries = allEntries.concat(entries);
        }
        
        // Apply filters
        if (source && typeof source === 'string') {
          allEntries = allEntries.filter(e => e.source.includes(source));
        }
        
        if (date && typeof date === 'string') {
          allEntries = allEntries.filter(e => e.date === date);
        }
        
        if (type && typeof type === 'string') {
          allEntries = allEntries.filter(e => e.type === type);
        }
        
        // Search query
        if (q && typeof q === 'string') {
          const query = q.toLowerCase();
          allEntries = allEntries.filter(e => 
            e.title?.toLowerCase().includes(query) ||
            e.content?.toLowerCase().includes(query) ||
            e.tags?.some(t => t.toLowerCase().includes(query))
          );
        }
        
        // Sort by date descending
        allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return res.status(200).json({ 
          entries: allEntries,
          total: allEntries.length,
          files: mdFiles.length 
        });
      }
      
      case 'POST': {
        const { title, content, date, tags, type = 'note' } = req.body;
        
        if (!title || !content) {
          return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const entryDate = date || new Date().toISOString().split('T')[0];
        const filename = `${entryDate}.md`;
        const filePath = path.join(MEMORY_DIR, filename);
        
        const tagsStr = tags?.length ? `\n\n${tags.map((t: string) => `#${t}`).join(' ')}` : '';
        const entry = `\n## ${entryDate}\n\n**${title}**\n\n${content}${tagsStr}\n\n---\n`;
        
        try {
          await fs.appendFile(filePath, entry, 'utf-8');
        } catch {
          await fs.writeFile(filePath, entry, 'utf-8');
        }
        
        return res.status(201).json({ 
          success: true, 
          message: 'Memory entry created',
          file: filename 
        });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
