import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:3001";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const auth = getAuth();
  const { setCart } = useCart();

  // Kosár betöltése backendről
  const fetchCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setCartItems([]);
        setCart(0);
        return;
      }

      const data = await res.json();

      const itemsWithDiscounts = await Promise.all(
        data.map(async (item) => {
          let finalPrice = item.price;
          let discountValue = null;

          try {
            const discountRes = await fetch(
              `${API_URL}/api/discounts/book/${item.book_id}`
            );

            if (discountRes.ok) {
              const discountData = await discountRes.json();
              if (discountData?.value) {
                discountValue = discountData.value;
                finalPrice = Math.round(
                  item.price * (1 - discountValue / 100)
                );
              }
            }
          } catch (err) {
            console.error("Akció lekérdezési hiba:", err);
          }

          return {
            ...item,
            cover_image_url: item.cover_image_url?.startsWith("http")
              ? item.cover_image_url
              : `${API_URL}${item.cover_image_url}`,
            final_price: finalPrice,
            discount: discountValue,
          };
        })
      );

      setCartItems(itemsWithDiscounts);

      const totalItems = itemsWithDiscounts.reduce(
        (sum, i) => sum + i.quantity,
        0
      );
      setCart(totalItems);
    } catch (err) {
      console.error("Kosár lekérési hiba:", err);
      setCartItems([]);
      setCart(0);
    }
  };

  // Auth állapot figyelése
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchCart();
      else {
        setCartItems([]);
        setCart(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_URL}/cart/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      fetchCart();
    } catch (err) {
      console.error("Mennyiség frissítési hiba:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_URL}/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCart();
    } catch (err) {
      console.error("Eltávolítási hiba:", err);
    }
  };

  const clearCart = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(0);
      fetchCart();
    } catch (err) {
      console.error("Kosár törlési hiba:", err);
    }
  };

  // Stripe fizetés indítása
  const handleStripeCheckout = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Jelentkezz be a fizetéshez!");
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch(
        `${API_URL}/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItems }),
        }
      );

      const data = await res.json();
      if (!data.url) {
        alert("Hiba történt a fizetés elindításakor.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Stripe fizetési hiba:", err);
      alert("Nem sikerült elindítani a fizetést.");
    }
  };

  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.final_price ?? item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Kosár</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">
          A kosarad jelenleg üres.
          <br />
          <Link
            to="/books"
            className="text-green-700 font-semibold hover:underline"
          >
            Irány vásárolni!
          </Link>
        </p>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={`${item.book_id}-${item.item_type}`}
                className="flex items-center justify-between bg-[#fefae0] p-5 rounded-2xl shadow-xl border border-yellow-300"
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

                    {item.item_type === "physical" && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-yellow-300 rounded"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="px-2 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-yellow-300 rounded"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  {item.discount ? (
                    <>
                      <p className="text-sm text-gray-500 line-through">
                        {(item.price * item.quantity).toLocaleString()} Ft
                      </p>
                      <p className="text-md font-semibold text-red-600">
                        {(item.final_price * item.quantity).toLocaleString()} Ft
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
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-300 rounded-lg flex justify-between shadow-md">
            <p className="text-lg font-bold text-green-900">
              Fizetendő: {total.toLocaleString()} Ft
            </p>

            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold"
              >
                Kosár törlése
              </button>

              <button
                onClick={handleStripeCheckout}
                className="bg-green-600 text-white px-6 py-2 rounded font-semibold"
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
