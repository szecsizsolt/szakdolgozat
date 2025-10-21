import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaMoon, FaSun, FaBookmark, FaEllipsisV } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function EbookReader({ book }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const nextPage = () => {
    if (currentPage < book.totalPages) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#0f172a] text-gray-100" : "bg-[#fdfaf2] text-gray-800"
      }`}
    >
      {/* Cím */}
      <h1
        className={`text-3xl md:text-4xl font-bold mb-6 text-center tracking-wide ${
          darkMode ? "text-yellow-300" : "text-yellow-700"
        }`}
      >
        {book.title}
      </h1>

      {/* Olvasókeret */}
      <div
        className={`relative w-[90%] max-w-4xl rounded-2xl shadow-2xl transition-colors duration-500 ${
          darkMode ? "bg-[#1e293b]" : "bg-white"
        } p-10 md:p-14 min-h-[600px]`}
      >
        {/* Vezérlő ikonok jobb felső sarokban */}
        <div className="absolute top-6 right-6 flex flex-col items-center space-y-5">
          <button
            onClick={toggleDarkMode}
            className="text-2xl hover:text-yellow-400 transition-transform hover:scale-110"
            title="Sötét mód váltása"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            className="text-2xl hover:text-yellow-400 transition-transform hover:scale-110"
            title="Könyvjelző"
          >
            <FaBookmark />
          </button>
          <button
            className="text-2xl hover:text-yellow-400 transition-transform hover:scale-110"
            title="Beállítások"
          >
            <FaEllipsisV />
          </button>
        </div>

        {/* Szöveg tartalom animációval */}
        <div className="flex flex-col justify-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: direction > 0 ? 150 : -150 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -150 : 150 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="leading-relaxed text-lg md:text-xl text-justify tracking-wide"
            >
              <p className="whitespace-pre-line">
                {book.content[(currentPage - 1) % book.content.length]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Lapozás vezérlők */}
      <div className="flex items-center justify-center space-x-8 mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-3 rounded-full text-3xl shadow-md transition-all ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
              : "bg-yellow-400 hover:bg-yellow-500 text-white"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FaArrowLeft />
        </button>

        <p
          className={`text-lg font-medium ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {currentPage} / {book.totalPages}
        </p>

        <button
          onClick={nextPage}
          disabled={currentPage === book.totalPages}
          className={`p-3 rounded-full text-3xl shadow-md transition-all ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
              : "bg-yellow-400 hover:bg-yellow-500 text-white"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
