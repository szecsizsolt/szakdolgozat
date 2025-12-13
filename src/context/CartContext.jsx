import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Bejelentkezett felhasználó kosarának betöltése
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:3001/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setCartCount(data.length);
        } else {
          setCartCount(0);
        }
      } catch (err) {
        console.error("Kosár lekérési hiba:", err);
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const incrementCart = () => {
    setCartCount((c) => c + 1);
  };

  const setCart = (count) => {
    setCartCount(count);
  };

  return (
    <CartContext.Provider
      value={{ cartCount, incrementCart, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
