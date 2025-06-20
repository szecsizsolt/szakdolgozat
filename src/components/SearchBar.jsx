import { useState } from "react";

const dummyTitles = [
  "Az alkimista",
  "1984",
  "A Gyűrűk Ura",
  "Harry Potter",
  "A Hobbit",
  "Büszkeség és balítélet",
  "Dűne",
  "A szolgálólány meséje",
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    setSuggestions(
      input.length > 1
        ? dummyTitles.filter((title) =>
            title.toLowerCase().includes(input.toLowerCase())
          )
        : []
    );
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <input
        type="text"
        placeholder="Keresés könyvre, szerzőre..."
        value={query}
        onChange={handleChange}
        className="w-full px-12 py-3 rounded-full shadow-md border border-gray-300 focus:ring-2 focus:ring-yellow-400"
      />
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>

      {suggestions.length > 0 && (
        <ul className="absolute z-20 bg-white border border-gray-200 mt-2 w-full rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((title, index) => (
                <li
                    key={index}
                    className="px-4 py-2 hover:bg-yellow-100 cursor-pointer text-olive-800"
                >
                    {title}
                </li>
            ))}
        </ul>
    )}
    </div>
  );
};

export default SearchBar;
