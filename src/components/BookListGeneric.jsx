import { useEffect, useState } from "react";
import BookCard from "./BookCard";

const CATEGORY_OPTIONS = [
    "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás",
];

export default function BookListGeneric({ apiUrl, title }) {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [sortBy, setSortBy] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  // Könyvek betöltése API-ról
  useEffect(() => {
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Nem sikerült betölteni az adatokat");
        return res.json();
      })
      .then((data) => {
        const updated = data.map((book) => ({
          ...book,
          cover_image_url: book.cover_image_url?.startsWith("http")
            ? book.cover_image_url
            : `http://localhost:3001${book.cover_image_url}`,
        }));
        setBooks(updated);
        setError(null);
      })
      .catch((err) => {
        console.error("Könyvek lekérése sikertelen:", err);
        setError("Nem sikerült betölteni a könyveket. Kérlek, próbáld újra később.");
      });
  }, [apiUrl]);

  // Szűrés kategória és keresés alapján
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === "Összes" || book.categories?.includes(selectedCategory);
    const matchesSearch =
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Rendezés
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (a.price || 0) - (b.price || 0);
      case "price-desc":
        return (b.price || 0) - (a.price || 0);
      case "title-asc":
        return (a.title || "").localeCompare(b.title || "");
      case "author-asc":
        return (a.author || "").localeCompare(b.author || "");
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-800">{title}</h1>

      {/* Keresőmező */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Keresés cím vagy szerző szerint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Kategória szűrés */}
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
        {CATEGORY_OPTIONS.map((cat) => (
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

      {/* Rendezés */}
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

      {/* Hibaüzenet */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Könyvek listája */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
