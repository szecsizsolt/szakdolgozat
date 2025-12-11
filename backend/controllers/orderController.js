import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

// ========================
// 1. Rendelés leadása
// ========================
export const placeOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const firebase_uid = req.user.uid;

    await client.query("BEGIN");

    // ---- Felhasználó lekérése ----
    const { rows: userRows } = await client.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [firebase_uid]
    );

    if (userRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Felhasználó nem található" });
    }

    const userId = userRows[0].id;

    // ---- Kosár lekérése könyvadatokkal ----
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

    // ---- Akciók kezelése + végösszeg kiszámítása ----
    let totalAmount = 0;
    const processedItems = [];

    for (const item of cartItems) {
      // Akció lekérdezése: discounts + book_discounts JOIN
      const { rows: discountRows } = await client.query(
        `
        SELECT d.value
        FROM book_discounts bd
        JOIN discounts d ON d.id = bd.discount_id
        WHERE bd.book_id = $1
        LIMIT 1
        `,
        [item.book_id]
      );

      const discount = discountRows.length > 0
        ? Number(discountRows[0].value)
        : null;

      const finalPrice = discount
        ? Math.round(item.price * (1 - discount / 100))
        : item.price;

      totalAmount += finalPrice * item.quantity;

      processedItems.push({
        ...item,
        finalPrice,
      });
    }

    const orderId = uuidv4();

    // ---- Státusz meghatározása ----
    const allDigital = processedItems.every((i) =>
      ["ebook", "audiobook"].includes(i.item_type)
    );
    const initialStatus = allDigital ? "done" : "pending";

    // ---- Rendelés rögzítése ----
    await client.query(
      `
      INSERT INTO orders (id, user_id, status, total_amount, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [orderId, userId, initialStatus, totalAmount]
    );

    // ---- Rendelési tételek és user_purchases rögzítése ----
    for (const item of processedItems) {
      await client.query(
        `
        INSERT INTO order_items (id, order_id, book_id, quantity, price_each)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [uuidv4(), orderId, item.book_id, item.quantity, item.finalPrice]
      );

      await client.query(
        `
        INSERT INTO user_purchases (id, user_id, book_id, item_type, order_id, purchased_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        `,
        [uuidv4(), userId, item.book_id, item.item_type, orderId]
      );
    }

    // ---- Kosár ürítése ----
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    res.status(200).json({ success: true, orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Rendelés leadása sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a rendelés során" });
  } finally {
    client.release();
  }
};

// ========================
// 2. Rendelések admin nézet
// ========================
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
          jsonb_build_object(
            'title', b.title,
            'item_type', b.type,
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
    console.error("❌ Rendelések lekérdezése sikertelen:", err);
    res.status(500).json({ error: "Szerverhiba a lekérdezés során" });
  }
};
