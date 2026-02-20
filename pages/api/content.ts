import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CONTENT_DATA_PATH = path.join(process.cwd(), 'data', 'content.json');

// Ensure data directory exists
const dataDir = path.dirname(CONTENT_DATA_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize with default data if doesn't exist
if (!fs.existsSync(CONTENT_DATA_PATH)) {
  fs.writeFileSync(CONTENT_DATA_PATH, JSON.stringify({ items: [] }, null, 2));
}

function loadContent() {
  try {
    const data = fs.readFileSync(CONTENT_DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { items: [] };
  }
}

function saveContent(data: any) {
  fs.writeFileSync(CONTENT_DATA_PATH, JSON.stringify(data, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id, action } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          return await getContentItem(req, res, id as string);
        }
        return await listContent(req, res);

      case 'POST':
        if (action === 'stage' && id) {
          return await updateStage(req, res, id as string);
        } else if (action === 'assign' && id) {
          return await assignContent(req, res, id as string);
        }
        return await createContent(req, res);

      case 'PUT':
        if (id) {
          return await updateContent(req, res, id as string);
        }
        break;

      case 'DELETE':
        if (id) {
          return await deleteContent(req, res, id as string);
        }
        break;
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('Content API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function listContent(req: NextApiRequest, res: NextApiResponse) {
  const { stage, type, assignedTo } = req.query;
  const data = loadContent();
  
  let items = data.items;
  
  if (stage) {
    items = items.filter((item: any) => item.stage === stage);
  }
  if (type) {
    items = items.filter((item: any) => item.type === type);
  }
  if (assignedTo) {
    items = items.filter((item: any) => item.assignedTo === assignedTo);
  }
  
  return res.status(200).json({ items, count: items.length });
}

async function getContentItem(req: NextApiRequest, res: NextApiResponse, id: string) {
  const data = loadContent();
  const item = data.items.find((i: any) => i.id === id);
  
  if (!item) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  return res.status(200).json(item);
}

async function createContent(req: NextApiRequest, res: NextApiResponse) {
  const { title, type = 'video', stage = 'idea', notes, script, thumbnailUrl, dueDate, assignedTo, tags } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const data = loadContent();
  
  const newItem = {
    id: Date.now().toString(),
    title,
    type,
    stage,
    notes: notes || '',
    script: script || '',
    hasThumbnail: !!thumbnailUrl,
    thumbnailUrl: thumbnailUrl || null,
    dueDate: dueDate || null,
    assignedTo: assignedTo || null,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        stage: 'idea',
        timestamp: new Date().toISOString(),
        action: 'created',
      }
    ],
  };
  
  data.items.push(newItem);
  saveContent(data);
  
  return res.status(201).json(newItem);
}

async function updateContent(req: NextApiRequest, res: NextApiResponse, id: string) {
  const updates = req.body;
  const data = loadContent();
  const index = data.items.findIndex((i: any) => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  data.items[index] = {
    ...data.items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveContent(data);
  return res.status(200).json(data.items[index]);
}

async function updateStage(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { stage, notes } = req.body;
  const stages = ['idea', 'script', 'thumbnail', 'filming', 'editing', 'published'];
  
  if (!stages.includes(stage)) {
    return res.status(400).json({ error: 'Invalid stage' });
  }
  
  const data = loadContent();
  const index = data.items.findIndex((i: any) => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  const oldStage = data.items[index].stage;
  data.items[index].stage = stage;
  data.items[index].updatedAt = new Date().toISOString();
  
  // Add to history
  if (!data.items[index].history) {
    data.items[index].history = [];
  }
  data.items[index].history.push({
    from: oldStage,
    to: stage,
    timestamp: new Date().toISOString(),
    action: 'stage_change',
    notes: notes || '',
  });
  
  saveContent(data);
  return res.status(200).json(data.items[index]);
}

async function assignContent(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { assignedTo, notes } = req.body;
  
  const data = loadContent();
  const index = data.items.findIndex((i: any) => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  const oldAssignee = data.items[index].assignedTo;
  data.items[index].assignedTo = assignedTo;
  data.items[index].updatedAt = new Date().toISOString();
  
  // Add to history
  if (!data.items[index].history) {
    data.items[index].history = [];
  }
  data.items[index].history.push({
    from: oldAssignee,
    to: assignedTo,
    timestamp: new Date().toISOString(),
    action: 'assigned',
    notes: notes || '',
  });
  
  saveContent(data);
  return res.status(200).json(data.items[index]);
}

async function deleteContent(req: NextApiRequest, res: NextApiResponse, id: string) {
  const data = loadContent();
  const index = data.items.findIndex((i: any) => i.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  data.items.splice(index, 1);
  saveContent(data);
  
  return res.status(200).json({ success: true });
}