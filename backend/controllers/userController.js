import pool from "../db.js";

export const getUserPurchases = async (req, res) => {
  try {
    const firebase_uid = req.user.uid;

    // Felhasználó azonosítása
    const { rows: userRows } = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [firebase_uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    const userId = userRows[0].id;

    // Vásárlások lekérése (csak digitális termékek)
    const { rows } = await pool.query(
      `
      SELECT 
        up.id AS purchase_id,
        up.item_type,
        up.purchased_at,
        b.id AS book_id,
        b.title,
        b.author,
        b.price,
        b.cover_image_url,
        b.type
      FROM user_purchases up
      LEFT JOIN books b ON up.book_id = b.id
      WHERE up.user_id = $1 
        AND up.item_type IN ('ebook', 'audiobook')
      ORDER BY up.purchased_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Vásárlások lekérdezése sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a vásárlások lekérdezésekor." });
  }
};
