import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // 🔍 Valós idejű keresés a backendről
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/books/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          // csak az első 5 találatot mutatjuk
          setSuggestions(data.slice(0, 5));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Keresési hiba:", err);
        setSuggestions([]);
      }
    };

    const delay = setTimeout(fetchSuggestions, 250); // kis késleltetés gépelés közben
    return () => clearTimeout(delay);
  }, [query]);

  // ✏️ input változás kezelése
  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  // 📖 könyv kiválasztása → átirányítás a részletekre
  const handleSelect = (bookId) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 🔍 Keresőmező */}
      <input
        type="text"
        placeholder="Keresés könyv vagy szerző szerint..."
        value={query}
        onChange={handleChange}
        className="w-full px-12 py-3 rounded-full shadow-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-olive-800"
      />
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
        🔍
      </span>

      {/* 📋 Javaslatok */}
      {suggestions.length > 0 && (
        <ul className="absolute z-20 bg-white border border-gray-200 mt-2 w-full rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((book) => (
            <li
              key={book.id}
              onClick={() => handleSelect(book.id)}
              className="px-4 py-2 hover:bg-yellow-100 cursor-pointer text-olive-800 flex justify-between"
            >
              <span>{book.title}</span>
              {book.author && (
                <span className="text-gray-500 text-sm italic">
                  {book.author}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
