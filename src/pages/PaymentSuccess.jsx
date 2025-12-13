import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const auth = getAuth();
  const { setCart } = useCart();
  const hasRun = useRef(false);

  // Rendelés rögzítése fizetés után (csak egyszer)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || hasRun.current) return;

      hasRun.current = true;

      try {
        const token = await user.getIdToken();

        const res = await fetch("http://localhost:3001/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setCart(0);
        }
      } catch (err) {
        console.error("Fizetés utáni feldolgozási hiba:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-green-700">
        Sikeres fizetés!
      </h1>

      <p className="mt-4 text-lg">
        A rendelést feldolgoztuk.
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
