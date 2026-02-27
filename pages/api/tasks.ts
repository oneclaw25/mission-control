import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Mock data for testing
const mockTasks = [
  {
    id: '1',
    title: 'Test Mission Control',
    description: 'Verify all systems working',
    status: 'in-progress',
    priority: 'high',
    assignee_id: 'oneclaw',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    estimated_hours: 2,
    actual_hours: 1,
    tags: ['testing', 'critical'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Deploy to Render',
    description: 'Deploy mission control dashboard',
    status: 'todo',
    priority: 'critical',
    assignee_id: 'builder',
    due_date: new Date(Date.now() + 172800000).toISOString(),
    estimated_hours: 3,
    tags: ['deployment', 'infrastructure'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (isSupabaseConfigured()) {
      switch (req.method) {
        case 'GET':
          const { status, assignee } = req.query;
          
          let query = supabase!
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

          if (status) query = query.eq('status', status);
          if (assignee) query = query.eq('assignee_id', assignee);

          const { data: tasks, error } = await query;

          if (error) {
            console.warn('Supabase error, using mock:', error.message);
            return res.status(200).json(mockTasks.map(t => ({ ...t, mock: true })));
          }

          return res.status(200).json(tasks || mockTasks);

        case 'POST':
          const newTask = req.body;
          const { data: created, error: createError } = await supabase!
            .from('tasks')
            .insert([{ ...newTask, created_at: new Date().toISOString() }])
            .select()
            .single();

          if (createError) {
            return res.status(201).json({ ...newTask, id: Date.now().toString(), mock: true });
          }
          return res.status(201).json(created);

        case 'PUT':
          const { id, ...updates } = req.body;
          if (updates.status === 'done') updates.completed_at = new Date().toISOString();
          updates.updated_at = new Date().toISOString();

          const { data: updated, error: updateError } = await supabase!
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (updateError) return res.status(200).json({ id, ...updates, mock: true });
          return res.status(200).json(updated);

        case 'DELETE':
          const { id: deleteId } = req.query;
          await supabase!.from('tasks').delete().eq('id', deleteId);
          return res.status(204).end();

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      // Mock mode
      switch (req.method) {
        case 'GET':
          return res.status(200).json(mockTasks.map(t => ({ ...t, mock: true })));
        case 'POST':
          return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
        case 'PUT':
          return res.status(200).json({ ...req.body, mock: true });
        case 'DELETE':
          return res.status(204).end();
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }
  } catch (error: any) {
    console.error('Tasks API error:', error);
    return res.status(200).json(mockTasks.map(t => ({ ...t, mock: true, error: error.message })));
  }
}
