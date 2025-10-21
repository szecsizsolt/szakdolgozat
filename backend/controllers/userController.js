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

    // ✅ Csak digitális termékek lekérése (mindkét oszlopban ellenőrizve)
    const { rows } = await pool.query(
      `
      SELECT 
        up.id AS purchase_id,
        up.item_type,
        up.purchased_at,
        b.id AS id,
        b.title,
        b.author,
        b.price,
        b.cover_image_url,
        b.type
      FROM user_purchases up
      JOIN books b ON up.book_id = b.id
      WHERE up.user_id = $1 
        AND (
          up.item_type IN ('ebook', 'audiobook')
          OR b.type IN ('ebook', 'audiobook')
        )
      ORDER BY up.purchased_at DESC
      `,
      [userId]
    );

    // Teljes URL a borítóképhez
    const formatted = rows.map((r) => ({
      ...r,
      cover_image_url:
        r.cover_image_url && !r.cover_image_url.startsWith("http")
          ? `http://localhost:3001${r.cover_image_url}`
          : r.cover_image_url,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Vásárlások lekérdezése sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a vásárlások lekérdezésekor." });
  }
};
