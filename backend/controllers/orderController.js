import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const createOrder = async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const user_id = userRows[0].id;

    const { rows: cartItems } = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1', [user_id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Kosár üres' });
    }

    const { rows: orderRows } = await pool.query(
      'INSERT INTO orders (user_id) VALUES ($1) RETURNING id',
      [user_id]
    );

    const order_id = orderRows[0].id;
    let totalAmount = 0;

    const insertPromises = cartItems.map(item => {
      totalAmount += item.price * item.quantity;
      return pool.query(`
        INSERT INTO order_items (order_id, book_id, quantity, price_each)
        VALUES ($1, $2, $3, $4)
      `, [order_id, item.book_id, item.quantity, item.price]);
    });

    await Promise.all(insertPromises);

    await pool.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2',
      [totalAmount, order_id]
    );

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    res.json({ success: true, order_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba rendelés létrehozásakor' });
  }
};

export const getOrders = async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const user_id = userRows[0].id;

    const { rows: orders } = await pool.query(`
      SELECT o.id AS order_id, o.status, o.total_amount, o.created_at,
             oi.book_id, b.title, b.cover_image_url, oi.quantity, oi.price_each
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [user_id]);

    const grouped = {};
    for (const row of orders) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          status: row.status,
          total_amount: row.total_amount,
          created_at: row.created_at,
          items: []
        };
      }

      grouped[row.order_id].items.push({
        book_id: row.book_id,
        title: row.title,
        cover_image_url: row.cover_image_url,
        quantity: row.quantity,
        price_each: row.price_each
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba rendelések lekérdezésekor' });
  }
};
