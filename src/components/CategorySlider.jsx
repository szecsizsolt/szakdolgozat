import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
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
  "Utazás"
];

export default function CategorySlider({ visibleCount = 3 }) {
  const [startIndex, setStartIndex] = useState(0);
  const total = categories.length;

  const prev = () => {
    setStartIndex((i) => (i - 1 + total) % total);
  };

  const next = () => {
    setStartIndex((i) => (i + 1) % total);
  };

  // Körkörösen kiválasztott látható kategóriák
  const visibleCategories = Array.from({ length: visibleCount }, (_, i) =>
    categories[(startIndex + i) % total]
  );

  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button
        onClick={prev}
        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600
                   text-white shadow-md flex items-center justify-center"
        aria-label="Előző kategóriák"
      >
        <ChevronLeft />
      </button>

      {visibleCategories.map((cat, index) => (
        <Link
          key={index}
          to={`/books?category=${encodeURIComponent(cat)}`}
          className="w-40 sm:w-64 h-16 sm:h-24 bg-gray-200 hover:bg-yellow-200
                     rounded-2xl text-lg font-semibold flex items-center
                     justify-center transition-transform hover:scale-105"
        >
          {cat}
        </Link>
      ))}

      <button
        onClick={next}
        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600
                   text-white shadow-md flex items-center justify-center"
        aria-label="Következő kategóriák"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
