import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // Űrlap mezők kezelése
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Regisztráció
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCred.user.uid;

      // Firestore felhasználó mentése
      await setDoc(doc(db, "users", uid), {
        uid,
        email: formData.email,
        username: formData.username,
        role: "user",
      });

      // Backend felhasználó mentése
      const token = await userCred.user.getIdToken();
      await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
        }),
      });

      navigate("/");
    } catch (err) {
      console.error("Regisztrációs hiba:", err);
      alert("Nem sikerült a regisztráció.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 px-8 py-10 bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">
        Regisztráció
      </h2>

      <form onSubmit={handleRegister} className="space-y-5">
        <input
          type="text"
          name="username"
          placeholder="Felhasználónév"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />

        <input
          type="email"
          name="email"
          placeholder="Email cím"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <input
          type="password"
          name="password"
          placeholder="Jelszó"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

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
