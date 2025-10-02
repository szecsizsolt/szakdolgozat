import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  // Űrlap állapot: felhasználói adatok
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // Input változás kezelése (dinamikus állapotfrissítés név alapján)
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Regisztrációs logika
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Firebase hitelesítés (új felhasználó létrehozása)
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCred.user.uid;

      // Felhasználó mentése Firestore "users" kollekcióba
      await setDoc(doc(db, "users", uid), {
        uid,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: "user", // alapértelmezett szerepkör
      });

      alert("Sikeres regisztráció!");
      navigate("/login");
    } catch (error) {
      console.error("Regisztrációs hiba:", error);
      alert("Hiba történt: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 px-8 py-10 bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">
        Regisztráció
      </h2>

      {/* Regisztrációs űrlap */}
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Névmezők (vezetéknév + keresztnév) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="lastName"
            placeholder="Vezetéknév"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <input
            type="text"
            name="firstName"
            placeholder="Keresztnév"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        {/* Email mező */}
        <input
          type="email"
          name="email"
          placeholder="Email cím"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* Jelszó mező */}
        <input
          type="password"
          name="password"
          placeholder="Jelszó"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* Beküldés gomb */}
        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-2 rounded shadow transition"
        >
          Regisztráció
        </button>
      </form>
    </div>
  );
}
