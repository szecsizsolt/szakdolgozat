import pool from "../db.js";

/**
 * 📘 Könyvhöz tartozó értékelések lekérése
 * - Megjeleníti a szerző nevét (users.name)
 * - Visszaadja a user_id-t is, hogy a frontend felismerje, melyik vélemény kié
 */
export const getReviewsByBook = async (req, res) => {
  const { bookId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.user_id,
        COALESCE(NULLIF(u.name, ''), u.email, 'Ismeretlen') AS display_name,
        u.email
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC
      `,
      [bookId]
    );


    res.json(rows);
  } catch (err) {
    console.error("❌ Hiba a vélemények lekérésekor:", err);
    res.status(500).json({ error: "Szerverhiba a vélemények lekérésekor." });
  }
};

/**
 * ✍️ Új vélemény hozzáadása
 * - Csak bejelentkezett felhasználó adhat le véleményt
 * - Egy user csak egy véleményt írhat könyvenként
 */
export const addReview = async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;

  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Bejelentkezés szükséges." });
    }

    // 🔹 Felhasználó azonosítása
    const { rows: userRows } = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [firebaseUid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    const userId = userRows[0].id;

    // 🔹 Ellenőrizzük, van-e már értékelése a könyvre
    const { rows: existing } = await pool.query(
      "SELECT id FROM reviews WHERE user_id = $1 AND book_id = $2",
      [userId, bookId]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Már írtál értékelést ehhez a könyvhöz!" });
    }

    // 🔹 Mentés az adatbázisba
    await pool.query(
      `
      INSERT INTO reviews (user_id, book_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [userId, bookId, rating, comment]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Hiba a vélemény mentésekor:", err);
    res.status(500).json({ error: "Szerverhiba a vélemény mentésekor." });
  }
};

/**
 * 🗑 Vélemény törlése
 * - Csak a saját vélemény törölhető
 */
export const deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Bejelentkezés szükséges." });
    }

    // 🔹 Felhasználó azonosítása
    const { rows: userRows } = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [firebaseUid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    const userId = userRows[0].id;

    // 🔹 Ellenőrzés: az adott review a useré-e
    const { rows: reviewRows } = await pool.query(
      "SELECT user_id FROM reviews WHERE id = $1",
      [reviewId]
    );

    if (reviewRows.length === 0) {
      return res.status(404).json({ error: "Vélemény nem található." });
    }

    if (reviewRows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Csak a saját véleményedet törölheted!" });
    }

    // 🔹 Törlés, ha minden stimmel
    await pool.query("DELETE FROM reviews WHERE id = $1", [reviewId]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Hiba a vélemény törlésekor:", err);
    res.status(500).json({ error: "Szerverhiba a vélemény törlésekor." });
  }
};
