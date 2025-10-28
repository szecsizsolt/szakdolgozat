import pool from '../db.js';

// 🔹 Segédfüggvény: Firebase UID → user_id
const getUserIdByFirebase = async (firebase_uid) => {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebase_uid]
  );
  return rows.length > 0 ? rows[0].id : null;
};

// =======================================================
// 📚 Csak fizikai könyvek listázása
// =======================================================
export const getAllBooks = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        b.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      GROUP BY b.id
      ORDER BY b.updated_at DESC
    `);

    // 🔹 Konvertáljuk át biztosan számmá
    const formatted = rows.map((b) => ({
      ...b,
      average_rating: parseFloat(b.average_rating),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Hiba a könyvek lekérdezésekor:", err);
    res.status(500).json({ error: "Szerverhiba a könyvek lekérdezésekor." });
  }
};


// =======================================================
// 📖 Egy könyv lekérése ID alapján (ebook info-val együtt)
// =======================================================
export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        b.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.id = $1
      GROUP BY b.id
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Könyv nem található." });
    }

    const book = rows[0];
    // 🔒 biztosítsuk, hogy szám legyen
    book.average_rating = Number(book.average_rating);

    res.json(book);
  } catch (err) {
    console.error("❌ Hiba a könyv lekérésekor:", err);
    res.status(500).json({ error: "Szerverhiba a könyv lekérésekor." });
  }
};

// =======================================================
// ➕ Új fizikai könyv létrehozása (admin)
// =======================================================
export const createBook = async (req, res) => {
  const {
    title,
    author,
    description,
    publisher,
    language,
    publication_date,
    price,
    stock,
    cover_image_url,
    categories
  } = req.body;

  const type = 'physical';

  try {
    const result = await pool.query(`
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price,
        stock, cover_image_url, categories, type
      )
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        title, author, description, publisher,
        language, publication_date, price,
        stock, cover_image_url, categories, type
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createBook hiba:", err);
    res.status(500).json({ error: 'Szerver hiba a könyv létrehozásakor.' });
  }
};

// =======================================================
// ✏️ Könyv frissítése
// =======================================================
export const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "Nincs frissítendő mező." });
  }

  const allowedFields = [
    "title", "author", "description", "publisher",
    "language", "publication_date", "price",
    "stock", "cover_image_url", "categories"
  ];

  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (!allowedFields.includes(key)) continue;
    setClauses.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: "Nincs érvényes frissítendő mező." });
  }

  values.push(bookId);

  try {
    const { rows } = await pool.query(
      `UPDATE books SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Könyv nem található a frissítéshez." });

    res.json(rows[0]);
  } catch (err) {
    console.error("updateBook hiba:", err);
    res.status(500).json({ error: "Szerver hiba a könyv frissítésekor." });
  }
};

// =======================================================
// ❌ Könyv törlése
// =======================================================
export const deleteBook = async (req, res) => {
  const bookId = req.params.id;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM books WHERE id = $1 AND type = $2',
      [bookId, 'physical']
    );

    if (rowCount === 0)
      return res.status(404).json({ error: 'Fizikai könyv nem található a törléshez.' });

    res.json({ success: true });
  } catch (err) {
    console.error("deleteBook hiba:", err);
    res.status(500).json({ error: 'Szerver hiba a könyv törlésekor.' });
  }
};

// =======================================================
// 🤖 Ajánlott könyvek (user / vendég logika)
// =======================================================
export const getRecommendedBooks = async (req, res) => {
  try {
    const firebaseUid = req.user?.uid || null;
    const userId = firebaseUid ? await getUserIdByFirebase(firebaseUid) : null; //
      "7eae0ae4-c4a5-4a63-8fe5-4acc7a308222"; // teszt user

    let result;

    if (userId) {
      // ✅ Kategória prioritás a darabszámokkal
      result = await pool.query(`
        WITH category_counts AS (
          SELECT 
            UNNEST(b.categories) AS category,
            SUM(oi.quantity) AS total_quantity
          FROM user_purchases up
          JOIN orders o ON o.id = up.order_id
          JOIN order_items oi ON oi.order_id = o.id AND oi.book_id = up.book_id
          JOIN books b ON b.id = up.book_id
          WHERE up.user_id = $1
          GROUP BY category
        ),
        review_stats AS (
          SELECT 
            book_id, 
            ROUND(AVG(rating)::numeric, 1) AS avg_rating,
            COUNT(rating) AS rating_count
          FROM reviews
          GROUP BY book_id
        )
        SELECT 
          b.*,
          COALESCE(rs.avg_rating, 0) AS avg_rating,
          COALESCE(rs.rating_count, 0) AS rating_count,
          COALESCE(cc.category_priority, 0) AS category_priority
        FROM books b
        LEFT JOIN review_stats rs ON rs.book_id = b.id
        LEFT JOIN LATERAL (
          SELECT SUM(total_quantity) AS category_priority
          FROM category_counts cc
          WHERE cc.category = ANY(b.categories)
        ) cc ON TRUE
        ORDER BY 
          category_priority DESC,
          avg_rating DESC,
          rating_count DESC,
          b.updated_at DESC;
      `, [userId]);
    } else {
      // ⚙️ Vendég fallback – értékelések alapján
      result = await pool.query(`
        WITH review_stats AS (
          SELECT 
            book_id, 
            ROUND(AVG(rating)::numeric, 1) AS avg_rating,
            COUNT(rating) AS rating_count
          FROM reviews
          GROUP BY book_id
        )
        SELECT 
          b.*,
          COALESCE(rs.avg_rating, 0) AS avg_rating,
          COALESCE(rs.rating_count, 0) AS rating_count
        FROM books b
        LEFT JOIN review_stats rs ON rs.book_id = b.id
        ORDER BY 
          avg_rating DESC,
          rating_count DESC,
          b.updated_at DESC;
      `);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("getRecommendedBooks hiba:", err);
    res.status(500).json({ message: "Hiba a könyvajánló lekérdezésben" });
  }
};

