import { neon } from 'https://esm.sh/@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Global CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 1. Handle OPTIONS preflight request immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 2. Reject non-POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 3. Verify Database URL existence
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is missing in Vercel.');
    }

    const data = await req.json();
    const {
      student_id,
      access_link,
      timestamp,
      attempt_id,
      worksheet_id,
      num_wrong,
      total_questions,
    } = data;

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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database Error:', error.message);
    
    // Return errors with CORS headers so the browser actually displays the server error message
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
