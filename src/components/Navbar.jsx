import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const cartItemCount = 2;

export default function Navbar() {
  return (
    <nav className="bg-[#f8f4db] shadow-md py-6">
      <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center relative">
        {/* Bal oldal: Site név */}
        <Link
          to="/"
          className="text-3xl font-bold text-olive-800 flex items-center gap-2"
        >
          📚 <span>Site name</span>
        </Link>

        {/* Közép: Menü */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-12 text-lg text-olive-800 font-medium">
          <Link to="/books" className="hover:underline">
            Könyvek
          </Link>
          <Link to="/ebooks" className="hover:underline">
            E-könyvek
          </Link>
          <Link to="/audio" className="hover:underline">
            Hangoskönyvek
          </Link>
          <Link to="/sales" className="hover:underline">
            Akciók
          </Link>
          <Link to="/toplist" className="hover:underline">
            Sikerlista
          </Link>
        </div>

        {/* Jobb oldal: Gombok */}
        <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative bg-white border border-yellow-500 text-olive-800 p-2 rounded shadow hover:bg-yellow-100"
            >
              <FaShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
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
    </nav>
  );
}
