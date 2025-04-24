import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  "Regény", "Gyerek", "Életmód", "Tudomány", "Történelem", "Fantasy", "Sci-fi"
];

const CategorySlider = () => {
  const [startIndex, setStartIndex] = useState(0);

  const total = categories.length;

  const prev = () => {
    setStartIndex((prevIndex) =>
      (prevIndex - 1 + total) % total
    );
  };

  const next = () => {
    setStartIndex((prevIndex) =>
      (prevIndex + 1) % total
    );
  };

  const visibleCategories = [
    categories[startIndex],
    categories[(startIndex + 1) % total],
    categories[(startIndex + 2) % total]
  ];

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
        <div
          key={index}
          className="w-64 h-24 bg-gray-200 hover:bg-yellow-200 rounded-2xl text-lg font-semibold flex items-center justify-center"
        >
          {cat}
        </div>
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
};

export default CategorySlider;
