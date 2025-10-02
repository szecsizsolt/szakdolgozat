import pool from '../db.js';

// ====== közös query-k ======
const baseSelect = `
  SELECT 
    ebooks.id AS id,
    books.id AS book_id,
    books.title, books.author, books.price, books.cover_image_url, 
    books.publisher, books.language, books.publication_date, 
    books.description, books.categories, books.type,
    ebooks.file_url, ebooks.file_format, ebooks.file_size_mb
  FROM ebooks
  JOIN books ON ebooks.book_id = books.id
`;

// ====== segédfüggvény ======
const toSafeNumber = (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

// ====== lekérdezések ======
export const getEbooks = async (_req, res) => {
  try {
    const { rows } = await pool.query(baseSelect);
    res.json(rows);
  } catch (err) {
    console.error("getEbooks hiba:", err);
    res.status(500).json({ error: 'Szerver hiba az e-könyvek lekérdezésekor.' });
  }
};

export const createEbook = async (req, res) => {
  const {
    title, author, description, publisher,
    language, publication_date, price,
    cover_image_url, categories,
    file_url, file_format, file_size_mb
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Books tábla
    const { rows: bookRows } = await client.query(`
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price, stock,
        cover_image_url, categories, type
      )
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, 0, $8, $9, 'ebook')
      RETURNING id
    `, [
      title, author, description, publisher,
      language, publication_date, price,
      cover_image_url, categories
    ]);
    const bookId = bookRows[0].id;

    // Ebooks tábla
    const { rows: ebookRows } = await client.query(`
      INSERT INTO ebooks (id, book_id, file_url, file_format, file_size_mb)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4)
      RETURNING id
    `, [bookId, file_url, file_format, toSafeNumber(file_size_mb)]);
    const ebookId = ebookRows[0].id;

    // Teljes rekord vissza
    const { rows } = await client.query(`${baseSelect} WHERE ebooks.id = $1`, [ebookId]);

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("createEbook hiba:", err);
    res.status(500).json({ error: 'Szerver hiba e-könyv létrehozásakor.' });
  } finally {
    client.release();
  }
};

export const updateEbook = async (req, res) => {
  const ebookId = req.params.id;
  const {
    title, author, description, publisher, language,
    publication_date, price, cover_image_url, categories,
    file_url, file_format, file_size_mb
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ellenőrzés
    const { rows: checkRows } = await client.query(
      'SELECT book_id FROM ebooks WHERE id = $1', [ebookId]
    );
    if (checkRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'E-könyv nem található' });
    }
    const bookId = checkRows[0].book_id;

    // Books update
    await client.query(`
      UPDATE books
      SET title = $1, author = $2, description = $3, publisher = $4,
          language = $5, publication_date = $6, price = $7,
          cover_image_url = $8, categories = $9
      WHERE id = $10
    `, [
      title, author, description, publisher,
      language, publication_date, price,
      cover_image_url, categories, bookId
    ]);

    // Ebooks update
    await client.query(`
      UPDATE ebooks
      SET file_url = $1, file_format = $2, file_size_mb = $3
      WHERE id = $4
    `, [file_url, file_format, toSafeNumber(file_size_mb), ebookId]);

    // Friss rekord vissza
    const { rows } = await client.query(`${baseSelect} WHERE ebooks.id = $1`, [ebookId]);

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("updateEbook hiba:", err);
    res.status(500).json({ error: 'Hiba az e-könyv frissítésekor.' });
  } finally {
    client.release();
  }
};

export const deleteEbook = async (req, res) => {
  const ebookId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT book_id FROM ebooks WHERE id = $1', [ebookId]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'E-könyv nem található' });
    }
    const bookId = rows[0].book_id;

    await client.query('DELETE FROM ebooks WHERE id = $1', [ebookId]);
    await client.query('DELETE FROM books WHERE id = $1', [bookId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("deleteEbook hiba:", err);
    res.status(500).json({ error: 'Szerver hiba e-könyv törlésekor.' });
  } finally {
    client.release();
  }
};
