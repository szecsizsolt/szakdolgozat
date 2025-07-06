import pool from '../db.js';

export const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM books WHERE type = 'physical'`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a könyvek lekérdezésekor.' });
  }
};

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
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a könyv létrehozásakor.' });
  }
};

export const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Nincs frissítendő mező.' });
  }

  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }
  values.push(bookId);

  const query = `UPDATE books SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`;
  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Könyv nem található a frissítéshez.' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a könyv frissítésekor.' });
  }
};

export const deleteBook = async (req, res) => {
  const bookId = req.params.id;
  try {
    const { rowCount } = await pool.query('DELETE FROM books WHERE id = $1', [bookId]);
    if (rowCount === 0)
      return res.status(404).json({ error: 'Könyv nem található a törléshez.' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba a könyv törlésekor.' });
  }
};
