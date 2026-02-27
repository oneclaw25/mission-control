import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Mock content items
const mockContent = [
  { id: '1', title: 'Ghost Army Video', type: 'video', stage: 'published', tags: ['wwii', 'viral'], created_at: new Date().toISOString() },
  { id: '2', title: 'Filthy Thirteen', type: 'video', stage: 'editing', tags: ['wwii', 'special-forces'], created_at: new Date().toISOString() },
  { id: '3', title: 'Ritchie Boys Script', type: 'video', stage: 'script', tags: ['wwii', 'intelligence'], created_at: new Date().toISOString() },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (isSupabaseConfigured()) {
      switch (req.method) {
        case 'GET':
          const { stage, type } = req.query;
          let query = supabase!.from('content_items').select('*').order('created_at', { ascending: false });
          if (stage) query = query.eq('stage', stage);
          if (type) query = query.eq('type', type);

          const { data: items, error } = await query;
          if (error) return res.status(200).json({ items: mockContent.map(i => ({ ...i, mock: true })) });
          return res.status(200).json({ items: items || mockContent });

        case 'POST':
          const { data: newItem, error: createError } = await supabase!
            .from('content_items')
            .insert([{ ...req.body, created_at: new Date().toISOString() }])
            .select()
            .single();
          if (createError) return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
          return res.status(201).json(newItem);

        case 'PUT':
          const { id, ...updates } = req.body;
          if (updates.stage === 'published') updates.published_at = new Date().toISOString();
          updates.updated_at = new Date().toISOString();

          const { data: updated, error: updateError } = await supabase!
            .from('content_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          if (updateError) return res.status(200).json({ id, ...updates, mock: true });
          return res.status(200).json(updated);

        case 'DELETE':
          const { id: deleteId } = req.query;
          await supabase!.from('content_items').delete().eq('id', deleteId);
          return res.status(204).end();

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      if (req.method === 'GET') return res.status(200).json({ items: mockContent.map(i => ({ ...i, mock: true })) });
      if (req.method === 'POST') return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
      if (req.method === 'PUT') return res.status(200).json({ ...req.body, mock: true });
      if (req.method === 'DELETE') return res.status(204).end();
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Content API error:', error);
    return res.status(200).json({ items: mockContent.map(i => ({ ...i, mock: true })), error: error.message });
  }
}
