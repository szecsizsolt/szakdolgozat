import { useState } from "react";
import BookCard from "../components/BookCard";
import placeholderImage from "../assets/peldakonyv.png";

const allBooks = [
  { id: 1, title: "Az alkimista", author: "Paulo Coelho", price: 2990, image: placeholderImage, category: "Regény" },
  { id: 2, title: "1984", author: "George Orwell", price: 3490, image: placeholderImage, category: "Tudomány" },
  { id: 3, title: "A Gyűrűk Ura", author: "J.R.R. Tolkien", price: 5990, image: placeholderImage, category: "Regény" },
  { id: 4, title: "Harry Potter", author: "J.K. Rowling", price: 3990, image: placeholderImage, category: "Fantasy" },
  { id: 5, title: "A Hobbit", author: "J.R.R. Tolkien", price: 2790, image: placeholderImage, category: "Fantasy" },
  { id: 6, title: "Büszkeség és balítélet", author: "Jane Austen", price: 3190, image: placeholderImage, category: "Regény" },
  { id: 7, title: "Dűne", author: "Frank Herbert", price: 4990, image: placeholderImage, category: "Sci-fi" },
  { id: 8, title: "A szolgálólány meséje", author: "Margaret Atwood", price: 3590, image: placeholderImage, category: "Tudomány" },
];

const categories = [
  "Regény", "Gyerek", "Életmód", "Tudomány", "Történelem", "Fantasy", "Sci-fi"
];

export default function BookList() {
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [sortBy, setSortBy] = useState("");

  const filteredBooks =
    selectedCategory === "Összes"
      ? allBooks
      : allBooks.filter((book) => book.category === selectedCategory);

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
            selectedCategory === "Összes" ? "bg-green-600 text-white" : "bg-white text-green-700 border-green-300 hover:bg-green-100"
          }`}
        >
          Összes
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              selectedCategory === cat ? "bg-green-600 text-white" : "bg-white text-green-700 border-green-300 hover:bg-green-100"
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
