import pool from "../db.js";
import fs from "fs/promises";
import path from "path";

// ====== közös query-k ======
const baseSelect = `
  SELECT 
    books.id AS id,
    books.title, books.author, books.price, books.cover_image_url, 
    books.publisher, books.language, books.publication_date, 
    books.description, books.categories, books.type,
    ebooks.id AS ebook_id,
    ebooks.file_url, ebooks.file_format, ebooks.file_size_mb
  FROM books
  LEFT JOIN ebooks ON ebooks.book_id = books.id
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
    // ⚙️ Csak az e-book típusú könyveket listázzuk itt
    const { rows } = await pool.query(`${baseSelect} WHERE books.type = 'ebook'`);
    res.json(rows);
  } catch (err) {
    console.error("getEbooks hiba:", err);
    res.status(500).json({ error: "Szerver hiba az e-könyvek lekérdezésekor." });
  }
};


export const getEbookById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `${baseSelect} WHERE books.id = $1::uuid`,
      [id.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "E-könyv nem található." });
    }

    const ebook = rows[0];

    if (ebook.file_url && ebook.file_url.endsWith(".txt")) {
      try {
        const filePath = path.resolve("uploads", path.basename(ebook.file_url));
        const text = await fs.readFile(filePath, "utf8");
        // Tisztítjuk a felesleges szóközöket, sortöréseket
        const cleanText = text
          .replace(/\r\n/g, '\n')            // Windows sortörések egységesítése
          .replace(/\n{3,}/g, '\n\n')        // Több üres sort -> 1 üres sort
          .replace(/[ \t]+/g, ' ')           // Többszörös szóköz törlése
          .trim();

        // Bekezdések alapján szétvágás
        const paragraphs = cleanText.split(/\n\s*\n/);

        // 📖 Fix hosszú oldalak (kb. 3500 karakter per oldal)
        const pages = [];
        let buffer = "";

        for (const para of paragraphs) {
          if ((buffer + "\n\n" + para).length > 3500) {
            pages.push(buffer.trim());
            buffer = para;
          } else {
            buffer += "\n\n" + para;
          }
        }
        if (buffer.trim()) pages.push(buffer.trim());

        ebook.content = pages;
        ebook.totalPages = pages.length;


      } catch (err) {
        console.error("❌ Fájl olvasási hiba:", err);
        ebook.content = ["A fájl nem olvasható vagy nem található."];
        ebook.totalPages = 1;
      }
    } else {
      ebook.content = ["Ez a formátum (pl. PDF/EPUB) nem megjeleníthető szövegként."];
      ebook.totalPages = 1;
    }

    res.json(ebook);
  } catch (err) {
    console.error("getEbookById hiba:", err);
    res.status(500).json({ error: "Szerver hiba e-könyv lekérdezésekor." });
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
    await client.query("BEGIN");

    // Books tábla
    const { rows: bookRows } = await client.query(
      `
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price, stock,
        cover_image_url, categories, type
      )
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, 0, $8, $9, 'ebook')
      RETURNING id
      `,
      [
        title, author, description, publisher,
        language, publication_date, price,
        cover_image_url, categories
      ]
    );
    const bookId = bookRows[0].id;

    // Ebooks tábla
    const { rows: ebookRows } = await client.query(
      `
      INSERT INTO ebooks (id, book_id, file_url, file_format, file_size_mb)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4)
      RETURNING id
      `,
      [bookId, file_url, file_format, toSafeNumber(file_size_mb)]
    );
    const ebookId = ebookRows[0].id;

    // Teljes rekord vissza
    const { rows } = await client.query(`${baseSelect} WHERE books.id = $1`, [bookId]);

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createEbook hiba:", err);
    res.status(500).json({ error: "Szerver hiba e-könyv létrehozásakor." });
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
    await client.query("BEGIN");

    // Ellenőrzés
    const { rows: checkRows } = await client.query(
      "SELECT book_id FROM ebooks WHERE id = $1",
      [ebookId]
    );
    if (checkRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "E-könyv nem található" });
    }
    const bookId = checkRows[0].book_id;

    // Books update
    await client.query(
      `
      UPDATE books
      SET title = $1, author = $2, description = $3, publisher = $4,
          language = $5, publication_date = $6, price = $7,
          cover_image_url = $8, categories = $9
      WHERE id = $10
      `,
      [
        title, author, description, publisher,
        language, publication_date, price,
        cover_image_url, categories, bookId
      ]
    );

    // Ebooks update
    await client.query(
      `
      UPDATE ebooks
      SET file_url = $1, file_format = $2, file_size_mb = $3
      WHERE id = $4
      `,
      [file_url, file_format, toSafeNumber(file_size_mb), ebookId]
    );

    // Friss rekord vissza
    const { rows } = await client.query(`${baseSelect} WHERE books.id = $1`, [bookId]);

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateEbook hiba:", err);
    res.status(500).json({ error: "Hiba az e-könyv frissítésekor." });
  } finally {
    client.release();
  }
};

export const deleteEbook = async (req, res) => {
  const ebookId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT book_id FROM ebooks WHERE id = $1",
      [ebookId]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "E-könyv nem található" });
    }
    const bookId = rows[0].book_id;

    await client.query("DELETE FROM ebooks WHERE id = $1", [ebookId]);
    await client.query("DELETE FROM books WHERE id = $1", [bookId]);

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("deleteEbook hiba:", err);
    res.status(500).json({ error: "Szerver hiba e-könyv törlésekor." });
  } finally {
    client.release();
  }
};
