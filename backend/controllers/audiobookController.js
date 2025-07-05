import pool from '../db.js';

export const createAudiobook = async (req, res) => {
  const {
    title, author, description, publisher,
    language, publication_date, price,
    cover_image_url, categories,
    audio_url, duration_min
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 👉 'audiobook' típus beállítása
    const bookInsert = await client.query(`
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price,
        stock, cover_image_url, categories, type
      )
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, 0, $8, $9, 'audiobook')
      RETURNING id
    `, [
      title, author, description, publisher,
      language, publication_date, price,
      cover_image_url, categories
    ]);

    const bookId = bookInsert.rows[0].id;

    const audiobookInsert = await client.query(`
      INSERT INTO audiobooks (id, book_id, audio_url, duration_min)
      VALUES (uuid_generate_v4(), $1, $2, $3)
      RETURNING id
    `, [bookId, audio_url, duration_min]);

    const { rows: fullRows } = await client.query(`
      SELECT audiobooks.*, 
             books.title, books.author, books.price, books.cover_image_url, 
             books.publisher, books.language, books.publication_date, 
             books.description, books.categories,
             books.type
      FROM audiobooks
      JOIN books ON audiobooks.book_id = books.id
      WHERE audiobooks.id = $1
    `, [audiobookInsert.rows[0].id]);

    await client.query("COMMIT");
    res.status(201).json(fullRows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Szerver hiba hangoskönyv létrehozásakor." });
  } finally {
    client.release();
  }
};


export const updateAudiobook = async (req, res) => {
  const audiobookId = req.params.id;
  const {
    title, author, description, publisher, language,
    publication_date, price, cover_image_url, categories,
    audio_url, duration_min, narrator
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT book_id FROM audiobooks WHERE id = $1', [audiobookId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hangoskönyv nem található' });
    }

    const bookId = rows[0].book_id;

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

    await client.query(`
      UPDATE audiobooks
      SET audio_url = $1, duration_min = $2, narrator = $3
      WHERE id = $4
    `, [
      audio_url, duration_min, narrator, audiobookId
    ]);

    const { rows: updatedRows } = await client.query(`
      SELECT audiobooks.*, 
             books.title, books.author, books.price, books.cover_image_url, 
             books.publisher, books.language, books.publication_date, 
             books.description, books.categories,
             books.type
      FROM audiobooks
      JOIN books ON audiobooks.book_id = books.id
      WHERE audiobooks.id = $1
    `, [audiobookId]);

    await client.query('COMMIT');
    res.json(updatedRows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba hangoskönyv frissítésekor.' });
  } finally {
    client.release();
  }
};

export const getAudiobookById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT audiobooks.*, 
             books.title, books.author, books.price, books.cover_image_url, 
             books.publisher, books.language, books.publication_date, 
             books.description, books.categories,
             books.type
      FROM audiobooks
      JOIN books ON audiobooks.book_id = books.id
      WHERE audiobooks.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nincs ilyen hangoskönyv" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lekérdezési hiba:", err);
    res.status(500).json({ error: "Szerver hiba hangoskönyv lekérdezésekor." });
  }
};


export const deleteAudiobook = async (req, res) => {
  const audiobookId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT book_id FROM audiobooks WHERE id = $1', [audiobookId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hangoskönyv nem található' });
    }

    const bookId = rows[0].book_id;

    await client.query('DELETE FROM audiobooks WHERE id = $1', [audiobookId]);
    await client.query('DELETE FROM books WHERE id = $1', [bookId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba hangoskönyv törlésekor.' });
  } finally {
    client.release();
  }
};

export const getAllAudiobooks = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        books.id AS book_id,
        audiobooks.id AS id,
        books.title, books.author, books.price, books.cover_image_url, 
        books.publisher, books.language, books.publication_date, 
        books.description, books.categories, books.type,
        audiobooks.audio_url, audiobooks.duration_min
      FROM audiobooks
      JOIN books ON audiobooks.book_id = books.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Szerver hiba hangoskönyvek lekérdezésekor.' });
  }
};

