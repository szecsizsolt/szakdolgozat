import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Felhasználói adatok betöltése
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (err) {
        console.error("Profil betöltési hiba:", err);
      }
    };

    loadUser();
  }, []);

  // Kijelentkezés
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Kijelentkezési hiba:", err);
      alert("Nem sikerült kijelentkezni.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 px-8 py-10 bg-white rounded-xl shadow-lg border text-center">
      <h2 className="text-3xl font-bold text-green-900 mb-6">
        Profil
      </h2>

      {userData ? (
        <>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold text-green-900">
              Felhasználónév:
            </span>{" "}
            {userData.username}
          </p>

          <p className="text-md text-gray-600 mb-6">
            <span className="font-semibold">Email:</span> {userData.email}
          </p>
        </>
      ) : (
        <p className="text-gray-500 mb-6">
          Adatok betöltése...
        </p>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded shadow"
      >
        Kijelentkezés
      </button>
    </div>
  );
}
