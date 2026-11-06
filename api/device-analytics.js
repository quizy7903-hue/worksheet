const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      network_type,
      battery_level,
      is_charging,
      downlink_speed,
      rtt,
      max_touch_points,
      color_scheme,
      cookies_enabled,
      platform
    } = req.body;

    await sql`
      INSERT INTO student_analytics (
        student_id, os, browser, device_type, screen_resolution, 
        viewport_size, language, timezone, device_memory, cpu_cores, 
        network_type, battery_level, is_charging, downlink_speed, 
        rtt, max_touch_points, color_scheme, cookies_enabled, platform
      ) VALUES (
        ${student_id}, ${os}, ${browser}, ${device_type}, ${screen_resolution}, 
        ${viewport_size}, ${language}, ${timezone}, ${device_memory}, ${cpu_cores}, 
        ${network_type}, ${battery_level}, ${is_charging}, ${downlink_speed}, 
        ${rtt}, ${max_touch_points}, ${color_scheme}, ${cookies_enabled}, ${platform}
      );
    `;

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Database Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
