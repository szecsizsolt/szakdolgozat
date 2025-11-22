import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const auth = getAuth();
  const { setCart } = useCart();
  
  // Ha a CartContext-ben tárolod a termékeket is:
  // const { setCartItems } = useCart();  <-- ha ilyen is van

  useEffect(() => {
    const clearCartAfterPayment = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const token = await user.getIdToken();

        // 💥 1. Kosár ürítése backend oldalon
        await fetch("http://localhost:3001/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 💥 2. Frontend kosár kiürítése
        setCart(0);
        // Ha a CartContext tárolja a kosár elemeket: setCartItems([]);

      } catch (err) {
        console.error("❌ Hiba a kosár törlésekor:", err);
      }
    };

    clearCartAfterPayment();
  }, [auth, setCart]);

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-green-700">Sikeres fizetés!</h1>
      <p className="mt-4 text-lg">
        Köszönjük a rendelésed, megkaptuk! Hamarosan küldjük a visszaigazolást.
      </p>

      <Link
        to="/"
        className="text-green-700 font-semibold hover:underline mt-6 inline-block"
      >
        Vissza a főoldalra
      </Link>
    </div>
  );
}
