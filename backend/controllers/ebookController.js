import pool from '../db.js';

export const getEbooks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        books.id AS book_id,
        ebooks.id AS id,
        books.author, books.price, books.cover_image_url, 
        books.publisher, books.language, books.publication_date, 
        books.description, books.categories, books.type,
        ebooks.file_url, ebooks.file_format, ebooks.file_size_mb
      FROM ebooks
      JOIN books ON ebooks.book_id = books.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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

    // Könyv beszúrása 'ebook' típusúként
    const bookInsert = await client.query(`
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

    const bookId = bookInsert.rows[0].id;

    // E-könyv beszúrása
    const ebookInsert = await client.query(`
      INSERT INTO ebooks (id, book_id, file_url, file_format, file_size_mb)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4)
      RETURNING id
    `, [bookId, file_url, file_format, file_size_mb]);

    const ebookId = ebookInsert.rows[0].id;

    // Összesített lekérdezés visszaküldéshez
    const { rows } = await client.query(`
      SELECT ebooks.*, 
             books.title, books.author, books.price, books.cover_image_url, 
             books.publisher, books.language, books.publication_date, 
             books.description, books.categories
      FROM ebooks
      JOIN books ON ebooks.book_id = books.id
      WHERE ebooks.id = $1
    `, [ebookId]);

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba e-könyv létrehozásakor.' });
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
    if (rows.length === 0)
      return res.status(404).json({ error: 'E-könyv nem található' });

    const bookId = rows[0].book_id;

    await client.query('DELETE FROM ebooks WHERE id = $1', [ebookId]);
    await client.query('DELETE FROM books WHERE id = $1', [bookId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba e-könyv törlésekor.' });
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

    // Frissítjük a books táblát
    await client.query(`
      UPDATE books
      SET title = $1, author = $2, description = $3, publisher = $4,
          language = $5, publication_date = $6, price = $7,
          cover_image_url = $8, categories = $9
      WHERE id = (SELECT book_id FROM ebooks WHERE id = $10)
    `, [
      title, author, description, publisher,
      language, publication_date, price,
      cover_image_url, categories, ebookId
    ]);

    // Frissítjük az ebooks táblát
    await client.query(`
      UPDATE ebooks
      SET file_url = $1, file_format = $2, file_size_mb = $3
      WHERE id = $4
    `, [file_url, file_format, file_size_mb, ebookId]);

    // Lekérjük az összesített adatot ugyanúgy, mint a GET /ebooks végpontban
    const { rows } = await client.query(`
      SELECT ebooks.*, 
             books.title, books.author, books.price, books.cover_image_url, 
             books.publisher, books.language, books.publication_date, 
             books.description, books.categories
      FROM ebooks
      JOIN books ON ebooks.book_id = books.id
      WHERE ebooks.id = $1
    `, [ebookId]);

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Hiba az e-könyv frissítésekor.' });
  } finally {
    client.release();
  }
};


