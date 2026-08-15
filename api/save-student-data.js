import { neon } from 'https://esm.sh/@neondatabase/serverless';

export default async function handler(req, res) {
  // Support standard Vercel serverless request handling
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      student_id, 
      access_link, 
      timestamp, 
      attempt_id, 
      worksheet_id, 
      num_wrong, 
      total_questions 
    } = req.body;

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO student_logs (
        student_id, access_link, attempt_id, worksheet_id, num_wrong, total_questions, timestamp
      ) VALUES (
        ${student_id}, ${access_link}, ${attempt_id}, ${worksheet_id}, ${num_wrong}, ${total_questions}, ${timestamp}
      );
    `;

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Database insertion error:', error);
    return res.status(500).json({ error: error.message });
  }
}
