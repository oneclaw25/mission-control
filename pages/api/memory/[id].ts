import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const MEMORY_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'memory');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Entry ID is required' });
  }

  try {
    // Parse ID to get file and line info
    const [filename, lineStr] = id.split('-');
    
    switch (req.method) {
      case 'GET': {
        // Read specific entry
        const filePath = path.join(MEMORY_DIR, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        
        return res.status(200).json({ 
          id,
          filename,
          content: content.substring(0, 5000) // Limit response size
        });
      }
      
      case 'PUT': {
        const { title, content: newContent, tags } = req.body;
        
        // For now, we'll append a new version with "(edited)" marker
        // In a full implementation, we'd modify the specific line range
        const entryDate = new Date().toISOString().split('T')[0];
        const filename = `${entryDate}.md`;
        const filePath = path.join(MEMORY_DIR, filename);
        
        const tagsStr = tags?.length ? `\n\n${tags.map((t: string) => `#${t}`).join(' ')}` : '';
        const entry = `\n## ${entryDate}\n\n**${title} (edited)**\n\n${newContent}${tagsStr}\n\n---\n`;
        
        try {
          await fs.appendFile(filePath, entry, 'utf-8');
        } catch {
          await fs.writeFile(filePath, entry, 'utf-8');
        }
        
        return res.status(200).json({ success: true, message: 'Entry updated' });
      }
      
      case 'DELETE': {
        // For now, we'll mark as deleted by appending a note
        // In a full implementation, we'd remove the specific entry
        return res.status(200).json({ 
          success: true, 
          message: 'Entry deletion not yet implemented - append-only memory' 
        });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Memory entry API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
