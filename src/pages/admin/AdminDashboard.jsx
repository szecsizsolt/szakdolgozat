import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const buttonStyle =
    "bg-yellow-400 hover:bg-yellow-500 text-green-900 py-3 px-6 font-bold rounded shadow";

  return (
    <div className="max-w-4xl mx-auto mt-20 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 text-center mb-6">
        Admin kezdőlap
      </h1>

      <p className="text-center text-gray-700 mb-8">
        Válassz egy műveletet az alábbi lehetőségek közül:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/admin/add-book")}
          className={buttonStyle}
        >
          Könyv kezelés
        </button>

        <button
          onClick={() => navigate("/admin/ebook")}
          className={buttonStyle}
        >
          E-könyv kezelés
        </button>

        <button
          onClick={() => navigate("/admin/audio")}
          className={buttonStyle}
        >
          Hangoskönyv kezelés
        </button>

        <button
          onClick={() => navigate("/admin/orders")}
          className={buttonStyle}
        >
          Rendelések
        </button>

        <button
          onClick={() => navigate("/admin/blog")}
          className={buttonStyle}
        >
          Blog kezelés
        </button>

        <button
          onClick={() => navigate("/admin/discounts")}
          className={buttonStyle}
        >
          Akció kezelés
        </button>
      </div>
    </div>
  );
}
