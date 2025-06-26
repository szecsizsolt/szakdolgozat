import express from 'express';
import { Pool } from 'pg';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import cors from 'cors';
import { readFileSync } from 'fs';
import multer from "multer";
import path from "path";


function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).send('Nincs jogosultság');
  }
  next();
}

// .env változók betöltése
dotenv.config();

// Firebase Admin inicializálása
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(readFileSync('./firebase-service-account.json', 'utf8'))
  ),
});

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL adatbázis kapcsolat
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware: Firebase token ellenőrzés
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).send('Hiányzó token');

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Érvénytelen token');
  }
}

// ➕ Regisztráció backend oldalon (csak egyszer, ha új felhasználó)
app.post('/register', authenticate, async (req, res) => {
  const { name, email } = req.body;
  const firebase_uid = req.user.uid;

  try {
    await pool.query(
      `INSERT INTO users (id, firebase_uid, name, email)
       VALUES (uuid_generate_v4(), $1, $2, $3)
       ON CONFLICT (firebase_uid) DO NOTHING`,
      [firebase_uid, name, email]
    );
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// 📚 Könyvek lekérése (csak ahol van raktárkészlet)
app.get('/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE stock > 0');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// 🛒 Kosár lekérdezése
app.get('/cart', authenticate, async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    // Felhasználó belső ID-jának lekérdezése
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );

    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');
    const user_id = userRows[0].id;

    const result = await pool.query(`
      SELECT ci.id, ci.quantity, ci.item_type, ci.added_at,
             b.title, b.price, b.cover_image_url
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      WHERE ci.user_id = $1
    `, [user_id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// ➕ Kosárhoz adás
app.post('/cart', authenticate, async (req, res) => {
  const { book_id, quantity, item_type } = req.body;
  const firebase_uid = req.user.uid;

  try {
    // Felhasználó azonosító lekérdezése
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );
    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');
    const user_id = userRows[0].id;

    // Új bejegyzés a kosárba
    await pool.query(`
      INSERT INTO cart_items (user_id, book_id, item_type, quantity, added_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [user_id, book_id, item_type, quantity]);

    res.send({ success: true });
  } catch (err) {
    console.error('Hiba a kosárhoz adáskor:', err);
    res.status(500).send('Szerver hiba');
  }
});

// 🗑️ Kosár elem törlése
app.delete('/cart/:id', authenticate, async (req, res) => {
  const cartItemId = req.params.id;
  const firebase_uid = req.user.uid;

  try {
    // Ellenőrzés: csak a saját kosarából törölhet
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );
    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');

    const user_id = userRows[0].id;

    // Csak akkor töröljük, ha az adott felhasználóhoz tartozik
    await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [cartItemId, user_id]
    );

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// ✏️ Kosár elem mennyiségének frissítése
app.patch('/cart/:id', authenticate, async (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;
  const firebase_uid = req.user.uid;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).send('Érvénytelen mennyiség');
  }

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );
    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');

    const user_id = userRows[0].id;

    await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
      [quantity, cartItemId, user_id]
    );

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// 🧹 Teljes kosár ürítése
app.delete('/cart', authenticate, async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );

    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');

    const user_id = userRows[0].id;

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// ✅ Rendelés leadása
app.post('/checkout', authenticate, async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );
    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');

    const user_id = userRows[0].id;

    const { rows: cartItems } = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1',
      [user_id]
    );
    if (cartItems.length === 0) return res.status(400).send('Kosár üres');

    const { rows: orderRows } = await pool.query(
        'INSERT INTO orders (user_id) VALUES ($1) RETURNING id',
        [user_id]
    );

    const order_id = orderRows[0].id;

    let totalAmount = 0;

    const insertPromises = cartItems.map(item => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;

    return pool.query(
        `INSERT INTO order_items (order_id, book_id, quantity, price_each)
        VALUES ($1, $2, $3, $4)`,
        [order_id, item.book_id, item.quantity, item.price]
    );
    });

    await Promise.all(insertPromises);

    // 💰 Rendelés végösszegének frissítése
    await pool.query(
    'UPDATE orders SET total_amount = $1 WHERE id = $2',
    [totalAmount, order_id]
    );

// Kosár törlése
await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

res.send({ success: true, order_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// rendelés listázás
app.get('/orders', authenticate, async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );
    if (userRows.length === 0) return res.status(404).send('Felhasználó nem található');

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

    // Csoportosítás rendelésenként
    const grouped = {};
    for (const row of orders) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          status: row.status,
          total_amount: row.total_amount,
          created_at: row.created_at,
          items: [],
        };
      }
      grouped[row.order_id].items.push({
        book_id: row.book_id,
        title: row.title,
        cover_image_url: row.cover_image_url,
        quantity: row.quantity,
        price_each: row.price_each,
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

//könyv létrehozása
app.post('/books', authenticate, isAdmin, async (req, res) => {
  const {
    title, author, description, publisher,
    language, publication_date, price,
    stock, cover_image_url, categories
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price,
        stock, cover_image_url, categories
      )
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title, author, description, publisher,
      language, publication_date, price,
      stock, cover_image_url, categories
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});


//könyv lekérdezése
app.get('/books/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [bookId]
    );

    if (rows.length === 0) return res.status(404).send('Könyv nem található');

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

//könyv frissités
app.patch('/books/:id', async (req, res) => {
  const bookId = req.params.id;
  const fields = req.body;

  // Nincsenek megadott mezők
  if (Object.keys(fields).length === 0) {
    return res.status(400).send('Nincs frissítendő mező');
  }

  // Dinamikus SQL építés
  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  values.push(bookId); // a végén jön az ID

  const query = `
    UPDATE books
    SET ${setClauses.join(', ')}
    WHERE id = $${i}
    RETURNING *`;

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).send('Könyv nem található');

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

//könyv törlés
app.delete('/books/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM books WHERE id = $1',
      [bookId]
    );

    if (rowCount === 0) {
      return res.status(404).send('Könyv nem található');
    }

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Szerver hiba');
  }
});

// Multer beállítás
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Kép feltöltés
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("Nincs kép feltöltve");
  const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Feltöltött fájlok kiszolgálása
app.use("/uploads", express.static("uploads"));


// 🔁 Indítás
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Szerver fut a(z) ${PORT} porton`);
});
