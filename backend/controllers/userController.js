import pool from "../db.js";


//  A felhasználó megvásárolt digitális tartalmainak lekérdezése.
export const getUserPurchases = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const { rows: userRows } = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [firebaseUid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        error: "Felhasználó nem található"
      });
    }

    const userId = userRows[0].id;

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

    const formatted = rows.map((row) => ({
      ...row,
      cover_image_url:
        row.cover_image_url && !row.cover_image_url.startsWith("http")
          ? `http://localhost:3001${row.cover_image_url}`
          : row.cover_image_url
    }));

    res.json(formatted);
  } catch (error) {
    console.error("getUserPurchases hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a vásárlások lekérdezésekor."
    });
  }
};
