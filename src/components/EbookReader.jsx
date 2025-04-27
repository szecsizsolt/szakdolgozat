import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaMoon, FaBookmark, FaEllipsisV } from "react-icons/fa";
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex flex-col items-center ${darkMode ? 'bg-gray-900' : 'bg-[#fefce8]'} min-h-screen p-6 transition-colors`}>
      {/* Könyv címe */}
      <h1 className="text-4xl font-bold text-center bg-yellow-300 py-5 px-10 rounded mb-8 w-full max-w-7xl">
        {book.title}
      </h1>

      {/* Tartalom (szöveg + oldalszám+nyilak külön) */}
      <div className={`flex flex-col items-center w-full max-w-7xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded shadow-lg p-10 min-h-[700px] relative transition-colors`}>
        
        {/* Extra gombok jobb felül */}
        <div className="absolute top-6 right-6 flex flex-col items-center space-y-4">
          <button onClick={toggleDarkMode} className="text-2xl hover:text-yellow-400">
            <FaMoon />
          </button>
          <button className="text-2xl hover:text-yellow-400">
            <FaBookmark />
          </button>
          <button className="text-2xl hover:text-yellow-400">
            <FaEllipsisV />
          </button>
        </div>

        {/* Szöveg */}
        <div className="flex-1 w-full text-left overflow-auto pr-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.4 }}
              className="text-lg leading-relaxed"
            >
              <p>{book.content[(currentPage - 1) % book.content.length]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Lapozás: nyilak + oldalszám alul középen */}
      <div className="flex items-center space-x-8 mt-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="text-4xl hover:text-black disabled:opacity-50"
        >
          <FaArrowLeft />
        </button>
        
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {currentPage} / {book.totalPages}
        </p>

        <button
          onClick={nextPage}
          disabled={currentPage === book.totalPages}
          className="text-4xl hover:text-black disabled:opacity-50"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
