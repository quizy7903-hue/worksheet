import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Read the environment variable from Vercel
  const sql = neon(process.env.DATABASE_URL);

  // Fetch top 10 scores
  if (req.method === 'GET') {
    try {
      const scores = await sql`
        SELECT name, score 
        FROM leaderboards 
        ORDER BY score DESC 
        LIMIT 10
      `;
      return res.status(200).json(scores);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 

  // Save new high score
  if (req.method === 'POST') {
    try {
      const { name, score } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score are required' });
      }

      await sql`
        INSERT INTO leaderboards (name, score) 
        VALUES (${name}, ${score})
      `;
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
