// Vercel serverless function: GET = top 10, POST = submit a score.
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const MAX_STARS = 61; // total stars in the level

// Table is created automatically on first request.
let ready;
const init = () =>
  ready ||
  (ready = sql`CREATE TABLE IF NOT EXISTS scores (
    name_key   text PRIMARY KEY,
    name       text NOT NULL,
    score      int  NOT NULL,
    stars      int  NOT NULL,
    time_ms    int  NOT NULL,
    falls      int  NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`);

// Score is always recomputed on the server (same formula as the game).
const calc = (stars, ms, falls) =>
  Math.max(0, stars * 100 + Math.max(0, 180 - Math.round(ms / 1000)) * 10 - falls * 50);

const top = () =>
  sql`SELECT name, score, stars, time_ms AS "timeMs", falls
      FROM scores ORDER BY score DESC, time_ms ASC LIMIT 10`;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await init();

    if (req.method === 'GET') {
      return res.status(200).json({ scores: await top() });
    }

    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const name = String(b.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
      const stars = Math.floor(Number(b.stars));
      const ms = Math.floor(Number(b.timeMs));
      const falls = Math.floor(Number(b.falls));

      if (
        !name ||
        !(stars >= 0 && stars <= MAX_STARS) ||
        !(ms >= 15000 && ms <= 3600000) ||
        !(falls >= 0 && falls <= 1000)
      ) {
        return res.status(400).json({ error: 'Invalid score' });
      }

      const score = calc(stars, ms, falls);
      const key = name.toLowerCase();

      // One row per username; only replace it if the new run is better.
      await sql`
        INSERT INTO scores (name_key, name, score, stars, time_ms, falls)
        VALUES (${key}, ${name}, ${score}, ${stars}, ${ms}, ${falls})
        ON CONFLICT (name_key) DO UPDATE SET
          name = EXCLUDED.name, score = EXCLUDED.score, stars = EXCLUDED.stars,
          time_ms = EXCLUDED.time_ms, falls = EXCLUDED.falls, created_at = now()
        WHERE EXCLUDED.score > scores.score
           OR (EXCLUDED.score = scores.score AND EXCLUDED.time_ms < scores.time_ms)`;

      const [me] = await sql`
        SELECT rank, score FROM (
          SELECT name_key, score,
                 RANK() OVER (ORDER BY score DESC, time_ms ASC) AS rank
          FROM scores
        ) x WHERE name_key = ${key}`;

      return res.status(200).json({ rank: Number(me.rank), best: me.score, scores: await top() });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
