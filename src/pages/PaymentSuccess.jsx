import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const auth = getAuth();
  const { setCart } = useCart();

  useEffect(() => {
    let executed = false;

    const finalizeOrder = async () => {
      if (executed) return;
      executed = true;

      const user = auth.currentUser;
      if (!user) return;

      try {
        const token = await user.getIdToken();

        // Rendelés mentése
        const orderRes = await fetch("http://localhost:3001/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!orderRes.ok) {
          console.error("❌ Hiba rendelés mentésekor");
        }

        setCart(0);

      } catch (err) {
        console.error("❌ Fizetés utáni feldolgozás hibája:", err);
      }
    };

    finalizeOrder();
  }, []);

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-green-700">Sikeres fizetés!</h1>
      <p className="mt-4 text-lg">
        Köszönjük a rendelésed! A fizetés sikeresen megtörtént, a rendelést
        feldolgoztuk.
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
