// src/pages/Profile.jsx

import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Sikeres kijelentkezés!");
      navigate("/");
    } catch (error) {
      console.error("Hiba a kijelentkezéskor:", error);
      alert("Hiba történt kijelentkezés közben.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 px-8 py-10 bg-white rounded-xl shadow-lg border text-center">
      <h2 className="text-3xl font-bold text-green-900 mb-6">Profil</h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded shadow"
      >
        Kijelentkezés
      </button>
    </div>
  );
}
