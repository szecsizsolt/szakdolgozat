import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

// 1. Rendelés leadása (felhasználói oldalról)
export const placeOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const firebase_uid = req.user.uid;

    await client.query("BEGIN");

    // Felhasználó lekérdezése
    const { rows: userRows } = await client.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [firebase_uid]
    );
    if (userRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Felhasználó nem található" });
    }
    const userId = userRows[0].id;

    // Kosár lekérése
    const { rows: cartItems } = await client.query(
      `SELECT ci.*, b.type AS item_type, b.price
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "A kosár üres" });
    }

    // Végösszeg
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const orderId = uuidv4();

    // Státusz meghatározás
    const allDigital = cartItems.every(
      (item) => item.item_type === "ebook" || item.item_type === "audiobook"
    );
    const initialStatus = allDigital ? "done" : "pending";

    // Rendelés rögzítése
    await client.query(
      `INSERT INTO orders (id, user_id, status, total_amount, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, userId, initialStatus, totalAmount]
    );

    // Tételek és vásárlások
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (id, order_id, book_id, quantity, price_each)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), orderId, item.book_id, item.quantity, item.price]
      );

      // Csak digitális termékeket regisztráljunk user_purchases-be azonnal
      if (item.item_type === "ebook" || item.item_type === "audiobook") {
        await client.query(
          `INSERT INTO user_purchases (id, user_id, book_id, item_type, order_id, purchased_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [uuidv4(), userId, item.book_id, item.item_type, orderId]
        );
      }
    }

    // Kosár ürítése
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    res.status(200).json({ success: true, orderId });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Rendelés leadása sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a rendelés során" });
  } finally {
    client.release();
  }
};

// 2. Összes rendelés lekérése adminnak
export const getAllOrders = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        o.id AS id,
        o.status,
        o.total_amount,
        o.created_at,
        u.name AS user_name,
        u.email AS user_email,
        json_agg(
          DISTINCT jsonb_build_object(
            'title', b.title,
            'item_type', oi.item_type, -- jobb az order_items-ből venni
            'quantity', oi.quantity,
            'price_each', oi.price_each
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN books b ON b.id = oi.book_id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Rendelések lekérdezése sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a lekérdezés során" });
  }
};
