import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    const scores = await sql`SELECT name, score FROM leaderboards ORDER BY score DESC LIMIT 10`;
    return res.status(200).json(scores);
  } 

  if (req.method === 'POST') {
    const { name, score } = JSON.parse(req.body);
    await sql`INSERT INTO leaderboards (name, score) VALUES (${name}, ${score})`;
    return res.status(200).json({ success: true });
  }
}
