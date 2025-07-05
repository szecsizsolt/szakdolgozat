import pool from '../db.js';

export const getCart = async (req, res) => {
  const firebase_uid = req.user.uid;
  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );
    if (userRows.length === 0)
      return res.status(404).json({ error: 'Felhasználó nem található' });

    const user_id = userRows[0].id;

    const result = await pool.query(`
      SELECT ci.id, ci.book_id, ci.quantity, ci.item_type, ci.added_at,
            b.title, b.price, b.cover_image_url, b.author, b.type
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      WHERE ci.user_id = $1
    `, [user_id]);


    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a kosár lekérdezésekor.' });
  }
};

export const addToCart = async (req, res) => {
  const { book_id, quantity, item_type } = req.body;
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );
    if (userRows.length === 0)
      return res.status(404).json({ error: 'Felhasználó nem található' });

    const user_id = userRows[0].id;

    await pool.query(`
      INSERT INTO cart_items (user_id, book_id, item_type, quantity, added_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, book_id, item_type)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    `, [user_id, book_id, item_type, quantity]);

    res.json({ success: true });
  } catch (err) {
    console.error('Hiba a kosárhoz adáskor:', err);
    res.status(500).json({ error: 'Szerver hiba a kosárhoz adáskor.' });
  }
};


export const updateCartItem = async (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;
  const firebase_uid = req.user.uid;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Érvénytelen mennyiség' });
  }

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );
    const user_id = userRows[0].id;

    await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
      [quantity, cartItemId, user_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a mennyiség frissítésekor.' });
  }
};

export const deleteCartItem = async (req, res) => {
  const cartItemId = req.params.id;
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );
    const user_id = userRows[0].id;

    await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [cartItemId, user_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a kosár elem törlésekor.' });
  }
};

export const clearCart = async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );
    const user_id = userRows[0].id;

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a kosár ürítésekor.' });
  }
};
