import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaMoon } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:3001";

export default function Ebook() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // E-könyv betöltése
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${API_URL}/ebooks/${id}`);
        if (!res.ok) throw new Error("E-könyv nem található");
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error("E-könyv betöltési hiba:", err);
      }
    };

    fetchBook();
  }, [id]);

  if (!book) {
    return (
      <p className="text-center py-10 text-gray-500">
        E-könyv betöltése...
      </p>
    );
  }

  const nextPage = () => {
    if (currentPage < book.totalPages) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div
      className={`flex flex-col items-center min-h-screen p-6 transition-colors ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-[#fefce8] text-gray-900"
      }`}
    >
      <h1
        className={`text-4xl font-bold text-center py-5 px-10 rounded mb-8 w-full max-w-7xl transition-colors ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-yellow-300 text-gray-900"
        }`}
      >
        {book.title}
      </h1>

      <div
        className={`flex flex-col w-full max-w-5xl relative rounded shadow-lg p-10 h-[80vh] overflow-auto transition-colors ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <div className="sticky top-4 self-end z-20">
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="text-2xl hover:text-yellow-400 bg-white/30 backdrop-blur-sm rounded-full p-2"
          >
            <FaMoon />
          </button>
        </div>

        <div className="h-max flex justify-center w-full">
          <div className="px-8 py-4 w-auto max-w-[90%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.4 }}
                className="text-lg leading-relaxed"
              >
                <p className="whitespace-pre-line text-justify">
                  {book.content[(currentPage - 1) % book.content.length]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8 mt-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="text-4xl disabled:opacity-50"
        >
          <FaArrowLeft />
        </button>

        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {currentPage} / {book.totalPages}
        </p>

        <button
          onClick={nextPage}
          disabled={currentPage === book.totalPages}
          className="text-4xl disabled:opacity-50"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
