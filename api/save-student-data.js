import { neon } from 'https://esm.sh/@neondatabase/serverless';

export default async function handler(req) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle browser CORS preflight check
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const data = await req.json();
    const { 
      student_id, 
      access_link, 
      timestamp, 
      attempt_id, 
      worksheet_id, 
      num_wrong, 
      total_questions 
    } = data;

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO student_logs (
        student_id, access_link, attempt_id, worksheet_id, num_wrong, total_questions, timestamp
      ) VALUES (
        ${student_id}, ${access_link}, ${attempt_id}, ${worksheet_id}, ${num_wrong}, ${total_questions}, ${timestamp}
      );
    `;

    return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
