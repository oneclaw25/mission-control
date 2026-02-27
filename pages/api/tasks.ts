import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ 
      error: 'Supabase not configured',
      tasks: []
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { status, assignee } = req.query;
        
        let query = supabase!
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }
        
        if (assignee) {
          query = query.eq('assignee_id', assignee);
        }

        const { data: tasks, error } = await query;

        if (error) throw error;

        return res.status(200).json(tasks || []);

      case 'POST':
        const { title, description, status: taskStatus, priority, assignee_id, due_date, estimated_hours, tags } = req.body;
        
        const { data: newTask, error: createError } = await supabase!
          .from('tasks')
          .insert([{
            title,
            description,
            status: taskStatus || 'todo',
            priority: priority || 'medium',
            assignee_id,
            due_date,
            estimated_hours,
            tags: tags || [],
            metadata: {}
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json(newTask);

      case 'PUT':
        const { id, ...updates } = req.body;
        
        if (updates.status === 'done') {
          updates.completed_at = new Date().toISOString();
        }
        
        updates.updated_at = new Date().toISOString();

        const { data: updatedTask, error: updateError } = await supabase!
          .from('tasks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json(updatedTask);

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        const { error: deleteError } = await supabase!
          .from('tasks')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;

        return res.status(204).end();

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Tasks API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      tasks: []
    });
  }
}
