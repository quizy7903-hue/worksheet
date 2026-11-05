import { sql } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Allow cross-origin / request handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    // Insert into Neon Database
    await sql`
      INSERT INTO wishes (name, message)
      VALUES (${name}, ${message});
    `;

    return res.status(200).json({ success: true, message: 'Wish saved successfully' });
  } catch (error) {
    console.error('Neon DB Error:', error);
    return res.status(500).json({ error: 'Failed to insert into Neon DB' });
  }
}
