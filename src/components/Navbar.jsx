import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [hover, setHover] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hitelesítés és kosár betöltése
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }

        try {
          const token = await user.getIdToken();
          const res = await fetch("http://localhost:3001/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Kosár lekérési hiba:", err);
          setCartItems([]);
        }
      } else {
        setUserData(null);
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Kosár összeg
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Menü linkek
  const navLinks = (
    <>
      <Link to="/books" className="hover:underline">Könyvek</Link>
      <Link to="/ebooks" className="hover:underline">E-könyvek</Link>
      <Link to="/audio" className="hover:underline">Hangoskönyvek</Link>
      <Link to="/my-digital-books" className="hover:underline">Digitális könyveim</Link>
      <Link to="/blog" className="hover:underline">Blog</Link>
      {userData?.role === "admin" && (
        <Link to="/admin" className="text-green-900 font-bold hover:underline">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-[#f8f4db] shadow-md py-4 relative z-50">
      <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center">

        {/* Bal oldal: logó */}
        <Link to="/" className="text-2xl font-bold text-olive-800">
          Könyvesbolt
        </Link>

        {/* Asztali menü */}
        <div className="hidden md:flex gap-8 text-lg text-olive-800 font-medium">
          {navLinks}
        </div>

        {/* Jobb oldal */}
        <div className="flex items-center gap-4">
          {userData ? (
            <>
              {/* Kosár */}
              <div
                className="relative"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                <Link
                  to="/cart"
                  className="relative inline-flex items-center bg-white border border-yellow-500 text-olive-800 p-2 rounded shadow hover:bg-yellow-100 cursor-pointer"
                >
                  <FaShoppingCart size={18} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                {/* Kosár előnézet */}
                {hover && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-sm text-olive-800 z-50">
                    <h3 className="font-semibold mb-2">Kosár</h3>
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500">A kosarad üres</p>
                    ) : (
                      <>
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                          {cartItems.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center border-b pb-1"
                            >
                              <div className="flex items-center gap-2">
                                {item.cover_image_url && (
                                  <img
                                    src={item.cover_image_url}
                                    alt={item.title}
                                    className="w-8 h-12 object-cover rounded"
                                  />
                                )}
                                <span>{item.title} × {item.quantity}</span>
                              </div>
                              <span>{(item.price * item.quantity).toLocaleString()} Ft</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex justify-between font-semibold">
                          <span>Összesen:</span>
                          <span>{total.toLocaleString()} Ft</span>
                        </div>
                        <Link
                          to="/cart"
                          className="block mt-3 w-full text-center bg-yellow-400 hover:bg-yellow-500 py-1.5 rounded font-bold"
                        >
                          Kosár megnyitása
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Profil */}
              <Link
                to="/profile"
                className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 text-sm rounded shadow font-bold"
              >
                Profil
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}

          {/* Hamburger menü mobilon */}
          <button
            className="md:hidden text-2xl text-olive-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f8f4db] border-t p-4 space-y-4 text-olive-800 font-medium">
          {navLinks}
        </div>
      )}
    </nav>
  );
}
