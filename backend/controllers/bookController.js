import pool from '../db.js';

// Csak fizikai könyvek listázása
export const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM books WHERE type = 'physical'`);
    res.json(result.rows);
  } catch (err) {
    console.error("getAllBooks hiba:", err);
    res.status(500).json({ error: 'Szerver hiba a könyvek lekérdezésekor.' });
  }
};

// Könyv lekérése ID alapján (csak fizikai + ebook esetén is visszaad file infót)
export const getBookById = async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        books.*, 
        ebooks.file_url,
        ebooks.file_format,
        ebooks.file_size_mb
      FROM books
      LEFT JOIN ebooks ON ebooks.book_id = books.id
      WHERE books.id = $1
    `, [bookId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Könyv nem található" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Hiba a könyv lekérdezésekor:", err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// Új fizikai könyv létrehozása
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

// Könyv frissítése
export const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Nincs frissítendő mező.' });
  }

  // Csak engedélyezett mezők listája
  const allowedFields = [
    "title", "author", "description", "publisher",
    "language", "publication_date", "price", "stock",
    "cover_image_url", "categories"
  ];

  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({ error: `Érvénytelen mező: ${key}` });
    }
    setClauses.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }
  values.push(bookId);

  const query = `UPDATE books SET ${setClauses.join(', ')} WHERE id = $${i} AND type = 'physical' RETURNING *`;
  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Könyv nem található a frissítéshez.' });

    res.json(rows[0]);
  } catch (err) {
    console.error("updateBook hiba:", err);
    res.status(500).json({ error: 'Szerver hiba a könyv frissítésekor.' });
  }
};

// Könyv törlése
export const deleteBook = async (req, res) => {
  const bookId = req.params.id;
  try {
    // Csak fizikai könyv törölhető ezen az endpointon
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
