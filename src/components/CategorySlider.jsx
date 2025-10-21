import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás",
];

export default function CategorySlider({ visibleCount = 3 }) {
  const [startIndex, setStartIndex] = useState(0);
  const total = categories.length;

  const prev = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + total) % total);
  }; 

  const next = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % total);
  };

  const visibleCategories = Array.from({ length: visibleCount }, (_, i) =>
    categories[(startIndex + i) % total]
  );

  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      {/* Bal nyíl */}
      <button
        onClick={prev}
        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md flex items-center justify-center"
      >
        <ChevronLeft />
      </button>

      {/* Kategóriák */}
      {visibleCategories.map((cat, index) => (
    <Link
      to={`/books?category=${encodeURIComponent(cat)}`}
      key={index}
      className="w-40 sm:w-64 h-16 sm:h-24 bg-gray-200 hover:bg-yellow-200 rounded-2xl 
                text-lg font-semibold flex items-center justify-center transition-transform hover:scale-105"
    >
      {cat}
    </Link>
      ))}

      {/* Jobb nyíl */}
      <button
        onClick={next}
        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md flex items-center justify-center"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
