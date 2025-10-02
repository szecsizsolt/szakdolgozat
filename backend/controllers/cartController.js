import pool from "../db.js";

// Segédfüggvény: felhasználó ID lekérése Firebase UID alapján
const getUserIdByFirebase = async (firebase_uid) => {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebase_uid]
  );
  return rows.length > 0 ? rows[0].id : null;
};

export const getCart = async (req, res) => {
  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) return res.status(404).json({ error: "Felhasználó nem található" });

    const { rows } = await pool.query(
      `
      SELECT ci.id, ci.book_id, ci.quantity, ci.item_type, ci.added_at,
             b.title, b.price, b.cover_image_url, b.author, b.type
      FROM cart_items ci
      LEFT JOIN books b ON ci.book_id = b.id
      WHERE ci.user_id = $1
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Kosár lekérési hiba:", err);
    res.status(500).json({ error: "Szerver hiba a kosár lekérdezésekor." });
  }
};

export const addToCart = async (req, res) => {
  const { book_id, quantity, item_type } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Érvénytelen mennyiség" });
  }

  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) return res.status(404).json({ error: "Felhasználó nem található" });

    await pool.query(
      `
      INSERT INTO cart_items (user_id, book_id, item_type, quantity, added_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, book_id, item_type)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      `,
      [userId, book_id, item_type, quantity]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Hiba a kosárhoz adáskor:", err);
    res.status(500).json({ error: "Szerver hiba a kosárhoz adáskor." });
  }
};

export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Érvénytelen mennyiség" });
  }

  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) return res.status(404).json({ error: "Felhasználó nem található" });

    await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3",
      [quantity, req.params.id, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Kosár elem frissítési hiba:", err);
    res.status(500).json({ error: "Szerver hiba a mennyiség frissítésekor." });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) return res.status(404).json({ error: "Felhasználó nem található" });

    await pool.query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [
      req.params.id,
      userId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("Kosár elem törlési hiba:", err);
    res.status(500).json({ error: "Szerver hiba a kosár elem törlésekor." });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) return res.status(404).json({ error: "Felhasználó nem található" });

    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Kosár ürítési hiba:", err);
    res.status(500).json({ error: "Szerver hiba a kosár ürítésekor." });
  }
};
