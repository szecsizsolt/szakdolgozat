import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);   // null = ellenőrzés alatt
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Figyeljük a felhasználói állapot változását
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Firestore lekérdezés a felhasználó role mezőjére
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Admin jogosultság ellenőrzési hiba:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Ellenőrzés folyamatban...</div>;
  }

  return isAdmin ? children : <Navigate to="/" />;
}
