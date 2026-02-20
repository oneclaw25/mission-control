import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const MEMORY_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'memory');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure memory directory exists
    try {
      await fs.access(MEMORY_DIR);
    } catch {
      await fs.mkdir(MEMORY_DIR, { recursive: true });
    }
    
    // Get all files
    const files = await fs.readdir(MEMORY_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    // Get file stats
    const fileDetails = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(MEMORY_DIR, filename);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extract tags from content
        const tagMatches = content.match(/#([\w-]+)/g) || [];
        const uniqueTags = Array.from(new Set(tagMatches.map(t => t.slice(1))));
        
        return {
          filename,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          created: stats.birthtime.toISOString(),
          entryCount: (content.match(/^##\s*\d{4}-\d{2}-\d{2}/gm) || []).length,
          tags: uniqueTags,
        };
      })
    );
    
    return res.status(200).json({ 
      files: fileDetails,
      total: fileDetails.length,
      totalSize: fileDetails.reduce((acc, f) => acc + f.size, 0)
    });
  } catch (error) {
    console.error('Memory files API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
