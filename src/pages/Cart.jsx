import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]); // Kosár tartalma
  const auth = getAuth();
  const { setCart } = useCart(); // 🔥 Navbar számláló frissítése

  // Kosár lekérése a backendtől
  const fetchCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3001/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setCartItems([]);
        setCart(0);
        return;
      }

      const data = await res.json();

      // Könyv képek és akciós árak betöltése
      const withImagesAndDiscounts = await Promise.all(
        data.map(async (item) => {
          let finalPrice = item.price;
          let discountValue = null;

          try {
            const discountRes = await fetch(
              `http://localhost:3001/api/discounts/book/${item.book_id}`
            );
            if (discountRes.ok) {
              const discountData = await discountRes.json();
              if (discountData?.value) {
                discountValue = discountData.value;
                finalPrice = Math.round(item.price * (1 - discountValue / 100));
              }
            }
          } catch (err) {
            console.error("⚠️ Akció lekérdezési hiba:", err);
          }

          return {
            ...item,
            cover_image_url: item.cover_image_url?.startsWith("http")
              ? item.cover_image_url
              : `http://localhost:3001${item.cover_image_url}`,
            final_price: finalPrice,
            discount: discountValue,
          };
        })
      );

      setCartItems(withImagesAndDiscounts);

      // 🔹 Számláló — összes darabszám
      const totalItems = withImagesAndDiscounts.reduce(
        (sum, i) => sum + i.quantity,
        0
      );
      setCart(totalItems);
    } catch (err) {
      console.error("⚠️ Kosár lekérési hiba:", err);
      setCartItems([]);
      setCart(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Darabszám frissítése (PATCH)
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await fetch(`http://localhost:3001/cart/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      fetchCart(); // 🔄 frissítés
    } catch (err) {
      console.error("⚠️ Mennyiség frissítési hiba:", err);
    }
  };

  // Elem eltávolítása a kosárból
  const removeFromCart = async (id) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await fetch(`http://localhost:3001/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCart(); // 🔄 frissítés
    } catch (err) {
      console.error("⚠️ Eltávolítási hiba:", err);
    }
  };

  // Kosár teljes törlése
  const clearCart = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await fetch("http://localhost:3001/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(0);
      fetchCart();
    } catch (err) {
      console.error("⚠️ Kosár törlési hiba:", err);
    }
  };

  // Megrendelés leadása
const handleCheckoutSimplePay = async () => {
  const user = auth.currentUser;
  const token = await user.getIdToken();

  const res = await fetch("http://localhost:3001/simplepay/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ total }),
  });

  const paymentData = await res.json();

  // 🔹 Másik action: NEM SimplePay URL, hanem mock server!
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "http://localhost:3001/simplepay/mock-prepare"; 


  Object.entries(paymentData).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = Array.isArray(value) ? JSON.stringify(value) : value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};




  // 💰 Összesítés akciós árakkal
  const total = cartItems.reduce(
    (sum, item) => sum + (item.final_price ?? item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Kosár</h1>

      {/* Ha üres a kosár */}
      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">
          A kosarad jelenleg üres. <br />
          <Link
            to="/books"
            className="text-green-700 font-semibold hover:underline"
          >
            Irány vásárolni!
          </Link>
        </p>
      ) : (
        <>
          {/* Kosár elemek listázása */}
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={`${item.book_id}-${item.item_type}`}
                className="flex items-center justify-between bg-[#fefae0] hover:shadow-2xl transition-shadow p-5 rounded-2xl shadow-xl border border-yellow-300"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.cover_image_url}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded-md border bg-white"
                  />
                  <div>
                    <Link to={`/book/${item.book_id}`}>
                      <h2 className="text-lg font-bold text-green-900 hover:underline">
                        {item.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600">
                      Szerző: {item.author}
                    </p>
                    <p className="text-sm text-gray-500 italic">
                      {item.item_type === "ebook" && "E-könyv"}
                      {item.item_type === "audiobook" && "Hangoskönyv"}
                      {item.item_type === "physical" && "Hagyományos könyv"}
                    </p>

                    {/* Mennyiség (csak fizikai könyveknél) */}
                    {item.item_type === "physical" ? (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-bold"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="px-2 text-sm font-medium text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-bold"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2 italic"></p>
                    )}
                  </div>
                </div>

                {/* Ár és eltávolítás */}
                <div className="flex flex-col items-end justify-between h-full gap-4">
                  {item.discount ? (
                    <>
                      <p className="text-sm text-gray-500 line-through">
                        {(item.price * item.quantity).toLocaleString()} Ft
                      </p>
                      <p className="text-md font-semibold text-red-600">
                        {(item.final_price * item.quantity).toLocaleString()} Ft{" "}
                        <span className="text-xs text-red-500 font-semibold">
                          (−{item.discount}%)
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-md font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString()} Ft
                    </p>
                  )}

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Eltávolítás"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Összesítés és akció gombok */}
          <div className="mt-8 p-4 bg-yellow-300 rounded-lg flex items-center justify-between shadow-md">
            <p className="text-lg font-bold text-green-900">
              Fizetendő: {total.toLocaleString()} Ft
            </p>
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
              >
                Kosár törlése
              </button>
              <button
                onClick={handleCheckoutSimplePay}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
              >
                Fizetés
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
