import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Szerepkör lekérdezése Firestore-ból
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const role = userData.role;

        // Tárolás localStorage-be (opcionális)
        localStorage.setItem("role", role);

        alert("Sikeres bejelentkezés!");
        // Irányítás role alapján
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert("Nincs jogosultság (nincs user dokumentum).");
      }

    } catch (error) {
      console.error("Bejelentkezési hiba:", error);
      alert("Hiba történt: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 px-8 py-10 bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">Bejelentkezés</h2>
      <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-2 rounded shadow transition">
          Bejelentkezés
        </button>
      </form>
    </div>
  );
}
