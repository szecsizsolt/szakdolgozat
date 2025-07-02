import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export async function ensureUserInDatabase(req, res, next) {
  const { uid, name = 'Ismeretlen', email } = req.user;

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      // Ha nincs a DB-ben, akkor beszúrjuk
      await pool.query(
        `INSERT INTO users (id, name, email, firebase_uid)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), name, email, uid]
      );
      console.log(`🆕 Új felhasználó beszúrva az adatbázisba: ${email}`);
    }

    next();
  } catch (err) {
    console.error("❌ Hiba a felhasználó ellenőrzésekor/beszúrásakor:", err);
    res.status(500).json({ error: "Felhasználó ellenőrzési hiba" });
  }
}
