import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const registerUser = async (req, res) => {
  const { name, email } = req.body;
  const firebase_uid = req.user?.uid;

  if (!firebase_uid) {
    return res.status(400).json({ error: "Hiányzó Firebase UID." });
  }

  try {
    await pool.query(
      `
      INSERT INTO users (id, firebase_uid, name, email, role)
      VALUES (uuid_generate_v4(), $1, $2, $3, 'customer')
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        updated_at = NOW()
      `,
      [firebase_uid, name, email]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ registerUser hiba:", err);
    res.status(500).json({ error: "Szerver hiba a regisztráció során." });
  }
};

