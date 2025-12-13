import pool from "../db.js";


//  Firebase UID alapján visszaadja a belső user azonosítót.
const getUserIdByFirebase = async (firebaseUid) => {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );
  return rows.length > 0 ? rows[0].id : null;
};

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

    const formatted = rows.map((book) => ({
      ...book,
      average_rating: Number(book.average_rating),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("getAllBooks hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a könyvek lekérdezésekor."
    });
  }
};

export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        b.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.id = $1
      GROUP BY b.id
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Könyv nem található."
      });
    }

    const book = rows[0];
    book.average_rating = Number(book.average_rating);

    res.json(book);
  } catch (error) {
    console.error("getBookById hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a könyv lekérésekor."
    });
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

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price,
        stock, cover_image_url, categories, type
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, 'physical'
      )
      RETURNING *
      `,
      [
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
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("createBook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a könyv létrehozásakor."
    });
  }
};

export const updateBook = async (req, res) => {
  const { id: bookId } = req.params;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({
      error: "Nincs frissítendő mező."
    });
  }

  const allowedFields = [
    "title",
    "author",
    "description",
    "publisher",
    "language",
    "publication_date",
    "price",
    "stock",
    "cover_image_url",
    "categories"
  ];

  const setClauses = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (!allowedFields.includes(key)) continue;
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  if (setClauses.length === 0) {
    return res.status(400).json({
      error: "Nincs érvényes frissítendő mező."
    });
  }

  values.push(bookId);

  try {
    const { rows } = await pool.query(
      `
      UPDATE books
      SET ${setClauses.join(", ")}
      WHERE id = $${index}
      RETURNING *
      `,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Könyv nem található a frissítéshez."
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("updateBook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a könyv frissítésekor."
    });
  }
};

export const deleteBook = async (req, res) => {
  const { id: bookId } = req.params;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM books WHERE id = $1 AND type = $2",
      [bookId, "physical"]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        error: "Fizikai könyv nem található a törléshez."
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("deleteBook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba a könyv törlésekor."
    });
  }
};

export const getRecommendedBooks = async (req, res) => {
  try {
    const firebaseUid = req.user?.uid || null;
    const userId = firebaseUid
      ? await getUserIdByFirebase(firebaseUid)
      : null;

    let result;

    if (userId) {
      result = await pool.query(
        `
        WITH category_counts AS (
          SELECT 
            UNNEST(b.categories) AS category,
            SUM(oi.quantity) AS total_quantity
          FROM user_purchases up
          JOIN orders o ON o.id = up.order_id
          JOIN order_items oi 
            ON oi.order_id = o.id AND oi.book_id = up.book_id
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
          b.updated_at DESC
        `,
        [userId]
      );
    } else {
      result = await pool.query(
        `
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
          b.updated_at DESC
        `
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("getRecommendedBooks hiba:", error);
    res.status(500).json({
      message: "Hiba a könyvajánló lekérdezésben"
    });
  }
};

export const searchBooks = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.json([]);
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT id, title, author
      FROM books
      WHERE LOWER(title) LIKE LOWER($1)
         OR LOWER(author) LIKE LOWER($1)
      ORDER BY title ASC
      LIMIT 5
      `,
      [`%${q}%`]
    );

    res.json(rows);
  } catch (error) {
    console.error("searchBooks hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a keresés során."
    });
  }
};
