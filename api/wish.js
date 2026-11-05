import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Read the environment variable from Vercel
  const sql = neon(process.env.DATABASE_URL);

  // Fetch all wishes (optional/useful for testing)
  if (req.method === 'GET') {
    try {
      const wishes = await sql`
        SELECT name, message, created_at 
        FROM wishes 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      return res.status(200).json(wishes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 

  // Save new wish
  if (req.method === 'POST') {
    try {
      const { name, message } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      if (!name || !message) {
        return res.status(400).json({ error: 'Name and wish are required' });
      }

      await sql`
        INSERT INTO wishes (name, message) 
        VALUES (${name}, ${message})
      `;
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
