import pool from "../db.js";


// Alap lekérdezés hangoskönyvekhez. 
const baseSelect = `
  SELECT 
    books.id AS id,
    books.title,
    books.author,
    books.price,
    books.cover_image_url,
    books.publisher,
    books.language,
    books.publication_date,
    books.description,
    books.categories,
    books.type,
    audiobooks.id AS audiobook_id,
    audiobooks.audio_url,
    audiobooks.duration_min,
    audiobooks.narrator
  FROM books
  LEFT JOIN audiobooks ON audiobooks.book_id = books.id
`;


 // Segédfüggvény a hangoskönyv hosszának normalizálására.
const normalizeDuration = (duration) =>
  duration ? Math.round(Number(duration)) : null;

export const createAudiobook = async (req, res) => {
  const {
    title,
    author,
    description,
    publisher,
    language,
    publication_date,
    price,
    cover_image_url,
    categories,
    audio_url,
    duration_min,
    narrator
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: bookRows } = await client.query(
      `
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price,
        stock, cover_image_url, categories, type
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4,
        $5, $6, $7, 0, $8, $9, 'audiobook'
      )
      RETURNING id
      `,
      [
        title,
        author,
        description,
        publisher,
        language,
        publication_date,
        price,
        cover_image_url,
        categories
      ]
    );

    const bookId = bookRows[0].id;

    await client.query(
      `
      INSERT INTO audiobooks (
        id, book_id, audio_url, duration_min, narrator
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4
      )
      `,
      [
        bookId,
        audio_url,
        normalizeDuration(duration_min),
        narrator
      ]
    );

    const { rows } = await client.query(
      `${baseSelect} WHERE books.id = $1`,
      [bookId]
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("createAudiobook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba hangoskönyv létrehozásakor."
    });
  } finally {
    client.release();
  }
};

export const updateAudiobook = async (req, res) => {
  const { id: audiobookId } = req.params;
  const {
    title,
    author,
    description,
    publisher,
    language,
    publication_date,
    price,
    cover_image_url,
    categories,
    audio_url,
    duration_min,
    narrator
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: linkRows } = await client.query(
      "SELECT book_id FROM audiobooks WHERE id = $1",
      [audiobookId]
    );

    if (linkRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Hangoskönyv nem található"
      });
    }

    const bookId = linkRows[0].book_id;

    await client.query(
      `
      UPDATE books
      SET
        title = $1,
        author = $2,
        description = $3,
        publisher = $4,
        language = $5,
        publication_date = $6,
        price = $7,
        cover_image_url = $8,
        categories = $9
      WHERE id = $10
      `,
      [
        title,
        author,
        description,
        publisher,
        language,
        publication_date,
        price,
        cover_image_url,
        categories,
        bookId
      ]
    );

    await client.query(
      `
      UPDATE audiobooks
      SET
        audio_url = $1,
        duration_min = $2,
        narrator = $3
      WHERE id = $4
      `,
      [
        audio_url,
        normalizeDuration(duration_min),
        narrator,
        audiobookId
      ]
    );

    const { rows } = await client.query(
      `${baseSelect} WHERE books.id = $1`,
      [bookId]
    );

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("updateAudiobook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba hangoskönyv frissítésekor."
    });
  } finally {
    client.release();
  }
};


export const getAudiobookById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `${baseSelect} WHERE books.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Hangoskönyv nem található"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("getAudiobookById hiba:", error);
    res.status(500).json({
      error: "Szerver hiba hangoskönyv lekérdezésekor."
    });
  }
};


export const deleteAudiobook = async (req, res) => {
  const { id: audiobookId } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT book_id FROM audiobooks WHERE id = $1",
      [audiobookId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Hangoskönyv nem található"
      });
    }

    const bookId = rows[0].book_id;

    await client.query(
      "DELETE FROM audiobooks WHERE id = $1",
      [audiobookId]
    );

    await client.query(
      "DELETE FROM books WHERE id = $1",
      [bookId]
    );

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("deleteAudiobook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba hangoskönyv törlésekor."
    });
  } finally {
    client.release();
  }
};


export const getAllAudiobooks = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `${baseSelect} WHERE books.type = 'audiobook'`
    );
    res.json(rows);
  } catch (error) {
    console.error("getAllAudiobooks hiba:", error);
    res.status(500).json({
      error: "Szerver hiba hangoskönyvek lekérdezésekor."
    });
  }
};
