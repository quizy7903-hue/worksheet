const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }

    const sql = neon(process.env.DATABASE_URL);
    const body = req.body;

    // Check if the request is sending device analytics data
    if (body.os || body.browser || body.device_type) {
      const {
        student_id,
        os,
        browser,
        device_type,
        screen_resolution,
        viewport_size,
        language,
        timezone,
        device_memory,
        cpu_cores,
        network_type
      } = body;

      await sql`
        INSERT INTO student_device_analytics (
          student_id, os, browser, device_type, screen_resolution, 
          viewport_size, language, timezone, device_memory, cpu_cores, network_type
        ) VALUES (
          ${student_id}, ${os}, ${browser}, ${device_type}, ${screen_resolution}, 
          ${viewport_size}, ${language}, ${timezone}, ${device_memory}, ${cpu_cores}, ${network_type}
        );
      `;
    } else {
      // Otherwise, handle standard worksheet submission logs
      const {
        student_id,
        access_link,
        timestamp,
        attempt_id,
        worksheet_id,
        num_wrong,
        total_questions,
      } = body;

      await sql`
        INSERT INTO student_logs (
          student_id, access_link, attempt_id, worksheet_id, num_wrong, total_questions, timestamp
        ) VALUES (
          ${student_id}, ${access_link}, ${attempt_id}, ${worksheet_id}, ${num_wrong}, ${total_questions}, ${timestamp}
        );
      `;
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Database Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
