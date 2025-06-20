import { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const cartItems = [
  { title: "1984", price: 3490 },
  { title: "Dűne", price: 4990 },
];

export default function Navbar() {
  const [hover, setHover] = useState(false);

  return (
    <nav className="bg-[#f8f4db] shadow-md py-6 relative z-50">
      <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center relative">
        {/* Bal oldal: Site név */}
        <Link
          to="/"
          className="text-3xl font-bold text-olive-800 flex items-center gap-2"
        >
          📚 <span>Site name</span>
        </Link>

        {/* Menü középen */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-12 text-lg text-olive-800 font-medium">
          <Link to="/books" className="hover:underline">Könyvek</Link>
          <Link to="/ebooks" className="hover:underline">E-könyvek</Link>
          <Link to="/audio" className="hover:underline">Hangoskönyvek</Link>
          <Link to="/sales" className="hover:underline">Akciók</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
        </div>

        {/* Jobb oldal: kosár + gombok */}
        <div className="flex items-center gap-4">
          {/* Kosár ikon + előnézet */}
          <div
            className="relative"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Link to="/cart" className="relative inline-flex items-center bg-white border border-yellow-500 text-olive-800 p-2 rounded shadow hover:bg-yellow-100 cursor-pointer">
              <FaShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {hover && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-sm text-olive-800 z-50">
                <h3 className="font-semibold mb-2">Kosár</h3>
                <ul className="space-y-1">
                  {cartItems.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.title}</span>
                      <span>{item.price} Ft</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bejelentkezés + Regisztráció gombok */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 text-sm rounded shadow font-bold"
            >
              Bejelentkezés
            </Link>
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 text-sm rounded shadow font-bold"
            >
              Regisztráció
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
