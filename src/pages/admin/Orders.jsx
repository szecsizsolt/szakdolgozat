import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3001/orders/admin/orders", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });


      const data = await res.json();
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">🔄 Betöltés...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        📦 Rendelések listája
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-700">Nincs leadott rendelés.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-yellow-300 shadow-md p-6 rounded-xl mb-6"
          >
            <div className="mb-4">
              <p className="font-bold text-lg text-green-900">
                Rendelés azonosító: {order.id}
              </p>
              <p className="text-gray-700">Felhasználó: {order.user_name} ({order.user_email})</p>
              <p className="text-gray-700">Állapot: {order.status}</p>
              <p className="text-gray-700">Dátum: {new Date(order.created_at).toLocaleString()}</p>
              <p className="text-gray-800 font-semibold mt-2">
                Összeg: {order.total_amount.toLocaleString()} Ft
              </p>
            </div>

            <div className="border-t pt-4">
              <h2 className="font-semibold mb-2 text-gray-800">📚 Tételek:</h2>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {item.title} ({item.item_type}) – {item.quantity} db × {item.price_each} Ft
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
