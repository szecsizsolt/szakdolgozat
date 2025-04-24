import { useState } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import placeholderImage from "../assets/peldakonyv.png";

const initialCart = [
  {
    id: 1,
    title: "Az Alkimista",
    author: "Paulo Coelho",
    price: 2990,
    quantity: 1,
    image: placeholderImage,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    price: 3490,
    quantity: 2,
    image: placeholderImage,
  },
];

export default function Cart() {
  const [cartItems, setCartItems] = useState(initialCart);

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
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
          🛒 A kosarad jelenleg üres. <br />
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
                key={item.id}
                className="flex items-center justify-between bg-[#fefae0] hover:shadow-2xl transition-shadow p-5 rounded-2xl shadow-xl border border-yellow-300"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded-md border bg-white"
                  />
                  <div>
                    <Link to={`/book/${item.id}`}>
                      <h2 className="text-lg font-bold text-green-900 hover:underline">
                        {item.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600">
                      Szerző: {item.author}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-1 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-bold"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="px-2 text-sm font-medium text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
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
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold">
                Fizetés
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
