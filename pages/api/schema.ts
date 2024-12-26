import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { schema } = req.body;
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('schemas')
      .upsert({ 
        schema: JSON.stringify(schema),
        // Add other fields as needed
      });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error saving schema:', error);
    return res.status(500).json({ message: 'Error saving schema' });
  }
} 