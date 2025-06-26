import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [sortBy, setSortBy] = useState("");
  const CATEGORY_OPTIONS = [
  "Szépirodalom",
  "Ismeretterjesztő",
  "Krimi",
  "Romantikus",
  "Sci-fi",
  "Fantasy",
  "Életrajz",
  "Önfejlesztés",
  "Történelem",
  "Gyermekkönyv",
  "Ifjúsági",
  "Thriller",
  "Üzleti",
  "Egészség és életmód",
  "Utazás",
];

const [categories] = useState(CATEGORY_OPTIONS);


useEffect(() => {
  // Könyvek betöltése
  fetch("http://localhost:3001/books")
    .then((res) => res.json())
    .then((data) => {
      // Ha az URL relatív, egészítsd ki a szerver címével
      const updated = data.map((book) => ({
        ...book,
        cover_image_url: book.cover_image_url?.startsWith("http")
          ? book.cover_image_url
          : `http://localhost:3001${book.cover_image_url}`,
      }));
      setBooks(updated);
    })
    .catch((err) => console.error("Könyv hiba:", err));
  }, []);

  const filteredBooks =
    selectedCategory === "Összes"
      ? books
      : books.filter((book) => book.categories?.includes(selectedCategory));

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "author-asc":
        return a.author.localeCompare(b.author);
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Könyvek</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory("Összes")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            selectedCategory === "Összes"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 border-green-300 hover:bg-green-100"
          }`}
        >
          Összes
        </button>
          {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            selectedCategory === cat
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 border-green-300 hover:bg-green-100"
          }`}
        >
          {cat}
        </button>
        ))}

      </div>

      <div className="mb-6">
        <label htmlFor="sort" className="font-medium text-green-800 mr-2">
          Rendezés:
        </label>
        <select
          id="sort"
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">-- Válassz --</option>
          <option value="price-asc">Ár szerint növekvő</option>
          <option value="price-desc">Ár szerint csökkenő</option>
          <option value="title-asc">Cím A-Z</option>
          <option value="author-asc">Szerző A-Z</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
