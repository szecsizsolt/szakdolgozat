import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

// 1. Rendelés leadása (felhasználói oldalról)
export const placeOrder = async (req, res) => {
  try {
    const firebase_uid = req.user.uid;

    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const userId = userRows[0].id;

    // Kosár lekérdezése (csatlakoztatjuk a books táblát a típus miatt)
    const cartRes = await pool.query(
      `SELECT ci.*, b.type as item_type, b.price
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const cartItems = cartRes.rows;

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "A kosár üres" });
    }

    // Összegzés
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const orderId = uuidv4();

    // ➕ Meghatározzuk a státuszt (ha csak e/a könyv van → done)
    const allDigital = cartItems.every(item =>
      item.item_type === 'ebook' || item.item_type === 'audiobook'
    );
    const initialStatus = allDigital ? 'done' : 'pending';

    // Rendelés létrehozása
    await pool.query(
      `INSERT INTO orders (id, user_id, status, total_amount, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, userId, initialStatus, totalAmount]
    );

    // Rendelési tételek + vásárlási napló
    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (id, order_id, book_id, quantity, price_each)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), orderId, item.book_id, item.quantity, item.price]
      );

      await pool.query(
        `INSERT INTO user_purchases (id, user_id, book_id, item_type, order_id, purchased_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [uuidv4(), userId, item.book_id, item.item_type, orderId]
      );
    }

    // Kosár ürítése
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    res.status(200).json({ success: true, orderId });
  } catch (err) {
    console.error("❌ Rendelés leadása sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a rendelés során" });
  }
};


// 2. Összes rendelés lekérése adminnak
export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id AS id,
        o.status,
        o.total_amount,
        o.created_at,
        u.name AS user_name,
        u.email AS user_email,
        json_agg(
          json_build_object(
            'title', b.title,
            'item_type', up.item_type,
            'quantity', oi.quantity,
            'price_each', oi.price_each
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN books b ON b.id = oi.book_id
      LEFT JOIN user_purchases up ON up.order_id = o.id AND up.book_id = b.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Rendelések lekérdezése sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a lekérdezés során" });
  }
};
