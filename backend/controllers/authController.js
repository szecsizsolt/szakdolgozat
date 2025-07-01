import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const registerUser = async (req, res) => {
  const { name, email } = req.body;
  const firebase_uid = req.user.uid;

  try {
    await pool.query(`
      INSERT INTO users (id, firebase_uid, name, email)
      VALUES (uuid_generate_v4(), $1, $2, $3)
      ON CONFLICT (firebase_uid) DO NOTHING
    `, [firebase_uid, name, email]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a regisztráció során.' });
  }
};
