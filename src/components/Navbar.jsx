import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth állapot figyelése + kosár betöltése
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        setCartItems([]);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        setUserData(snap.exists() ? snap.data() : null);

        const token = await user.getIdToken();
        const res = await fetch("http://localhost:3001/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          setCartItems(await res.json());
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Auth/kosár betöltési hiba:", err);
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Menü linkek (asztali + mobil)
  const navLinks = (
    <>
      <Link to="/books" className="hover:underline">Könyvek</Link>
      <Link to="/ebooks" className="hover:underline">E-könyvek</Link>
      <Link to="/audio" className="hover:underline">Hangoskönyvek</Link>
      <Link to="/my-digital-books" className="hover:underline">
        Digitális könyveim
      </Link>
      <Link to="/blog" className="hover:underline">Blog</Link>

      {userData?.role === "admin" && (
        <Link
          to="/admin"
          className="text-green-900 font-bold hover:underline"
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-[#f8f4db] shadow-md py-4 relative z-50">
      <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-olive-800">
          Könyvesbolt
        </Link>

        <div className="hidden md:flex gap-8 text-lg text-olive-800 font-medium">
          {navLinks}
        </div>

        <div className="flex items-center gap-4">
          {userData ? (
            <>
              <Link
                to="/cart"
                className="relative inline-flex items-center bg-white
                           border border-yellow-500 text-olive-800
                           p-2 rounded shadow hover:bg-yellow-100"
              >
                <FaShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    data-testid="cart-count"
                    className="absolute -top-2 -right-2 bg-red-600
                               text-white text-xs font-bold
                               px-1.5 py-0.5 rounded-full"
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className="bg-yellow-400 hover:bg-yellow-500
                           px-3 py-1.5 text-sm rounded shadow font-bold"
              >
                Profil
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-yellow-400 hover:bg-yellow-500
                           px-3 py-1.5 text-sm rounded shadow font-bold"
              >
                Bejelentkezés
              </Link>
              <Link
                to="/register"
                className="bg-yellow-400 hover:bg-yellow-500
                           px-3 py-1.5 text-sm rounded shadow font-bold"
              >
                Regisztráció
              </Link>
            </>
          )}

          <button
            className="md:hidden text-2xl text-olive-800"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Mobil menü"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f8f4db] border-t p-4
                        space-y-4 text-olive-800 font-medium">
          {navLinks}
        </div>
      )}
    </nav>
  );
}
