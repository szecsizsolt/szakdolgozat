import pool from "../db.js";


const getUserIdByFirebase = async (firebaseUid) => {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );
  return rows.length > 0 ? rows[0].id : null;
};


export const getCart = async (req, res) => {
  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        ci.id,
        ci.book_id,
        ci.quantity,
        ci.item_type,
        ci.added_at,
        COALESCE(b.title, 'Ismeretlen cím') AS title,
        COALESCE(b.price, 0) AS price,
        b.cover_image_url,
        COALESCE(b.author, 'Ismeretlen szerző') AS author,
        b.type
      FROM cart_items ci
      LEFT JOIN books b ON ci.book_id = b.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("getCart hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a kosár lekérdezésekor."
    });
  }
};


export const addToCart = async (req, res) => {
  let { book_id, quantity = 1, item_type } = req.body;

  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    if (item_type === "ebook" || item_type === "audiobook") {
      quantity = 1;

      const { rows: purchased } = await pool.query(
        `
        SELECT 1
        FROM user_purchases
        WHERE user_id = $1 AND book_id = $2 AND item_type = $3
        `,
        [userId, book_id, item_type]
      );

      if (purchased.length > 0) {
        return res.status(400).json({
          error: "Ezt a digitális könyvet már megvásároltad."
        });
      }

      const { rows: existing } = await pool.query(
        `
        SELECT 1
        FROM cart_items
        WHERE user_id = $1 AND book_id = $2 AND item_type = $3
        `,
        [userId, book_id, item_type]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Ez a digitális könyv már a kosárban van."
        });
      }
    }

    await pool.query(
      `
      INSERT INTO cart_items (user_id, book_id, item_type, quantity, added_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, book_id, item_type)
      DO UPDATE SET
        quantity = CASE
          WHEN cart_items.item_type = 'physical'
            THEN cart_items.quantity + EXCLUDED.quantity
          ELSE 1
        END
      `,
      [userId, book_id, item_type, quantity]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("addToCart hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a kosárhoz adáskor."
    });
  }
};


export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    const { rows } = await pool.query(
      `
      SELECT item_type
      FROM cart_items
      WHERE id = $1 AND user_id = $2
      `,
      [req.params.id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Kosár elem nem található" });
    }

    if (rows[0].item_type !== "physical") {
      return res.status(400).json({
        error: "Digitális könyv mennyisége nem módosítható."
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: "Érvénytelen mennyiség" });
    }

    await pool.query(
      `
      UPDATE cart_items
      SET quantity = $1
      WHERE id = $2 AND user_id = $3
      `,
      [quantity, req.params.id, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("updateCartItem hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a mennyiség frissítésekor."
    });
  }
};


export const deleteCartItem = async (req, res) => {
  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2",
      [req.params.id, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("deleteCartItem hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a kosár elem törlésekor."
    });
  }
};


export const clearCart = async (req, res) => {
  try {
    const userId = await getUserIdByFirebase(req.user.uid);
    if (!userId) {
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1",
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("clearCart hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a kosár ürítésekor."
    });
  }
};
