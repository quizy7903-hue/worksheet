import { neon } from 'https://esm.sh/@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 1. Handle CORS Preflight (OPTIONS request)
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
    // 3. Extract environment variable safely for Edge Runtime
    const dbUrl = typeof process !== 'undefined' && process.env ? process.env.DATABASE_URL : null;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is missing in Vercel environment variables.');
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

    // 4. Connect to Neon
    const sql = neon(dbUrl);

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
    console.error('Database Edge Function Error:', error.message);

    // Return 500 WITH CORS headers so the browser displays the actual error message
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
