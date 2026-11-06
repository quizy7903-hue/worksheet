import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Optional CORS headers if accessing from separate pages/domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = neon(process.env.DATABASE_URL);

  // GET: Fetch the latest 50 wishes
  if (req.method === 'GET') {
    try {
      const wishes = await sql`
        SELECT id, name, message, created_at 
        FROM wishes 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      return res.status(200).json(wishes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 

  // POST: Save a new wish
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, message } = body;

      if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
      }

      await sql`
        INSERT INTO wishes (name, message) 
        VALUES (${name.trim()}, ${message.trim()})
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
