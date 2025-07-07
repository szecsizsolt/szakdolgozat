import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const auth = getAuth();

    const fetchCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const res = await fetch("http://localhost:3001/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setCartItems(
      data.map((item) => ({
        ...item,
        cover_image_url: item.cover_image_url?.startsWith("http")
          ? item.cover_image_url
          : `http://localhost:3001${item.cover_image_url}`,
      }))
    );
  };


  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

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

    fetchCart();
  };

  const removeFromCart = async (id) => {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    await fetch(`http://localhost:3001/cart/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchCart();
  };

  const clearCart = async () => {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    await fetch("http://localhost:3001/cart", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchCart();
  };

  const handleCheckout = async () => {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const res = await fetch('http://localhost:3001/orders/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("Rendelés sikeresen leadva!");
      fetchCart(); // újratölti a kosarat
    } else {
      const err = await res.json();
      alert("Hiba a rendelés során: " + err.error);
    }
  };


  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-green-900 mb-6">🛒 Kosár</h1>

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
                      {item.item_type === 'ebook' && 'E-könyv'}
                      {item.item_type === 'audiobook' && 'Hangoskönyv'}
                      {item.item_type === 'physical' && 'Hagyományos könyv'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-bold"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="px-2 text-sm font-medium text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-bold"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-4">
                  <p className="text-md font-semibold text-gray-800">
                    {item.price * item.quantity} Ft
                  </p>
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
                onClick={handleCheckout}
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
