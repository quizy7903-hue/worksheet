
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200 });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const data = await req.json();
    const { student_id, access_link, timestamp, attempt_id, worksheet_id, num_wrong, total_questions } = data;

    // Uses the DATABASE_URL auto-generated when you added Neon in Vercel
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO student_logs (
        student_id, access_link, attempt_id, worksheet_id, num_wrong, total_questions, timestamp
      ) VALUES (
        ${student_id}, ${access_link}, ${attempt_id}, ${worksheet_id}, ${num_wrong}, ${total_questions}, ${timestamp}
      );
    `;

    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
