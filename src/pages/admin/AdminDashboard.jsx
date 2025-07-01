import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto mt-20 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 text-center mb-6">
        Admin kezdőlap
      </h1>
      <p className="text-center text-gray-700 mb-8">
        Válassz egy műveletet az alábbi lehetőségek közül:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/admin/add-book")}
          className="bg-yellow-400 hover:bg-yellow-500 text-green-900 py-3 px-6 font-bold "
        >
          Könyv kezelés
        </button>
        <button
          onClick={() => navigate("/admin/ebook")}
          className="bg-yellow-400 hover:bg-yellow-500 text-green-900 py-3 px-6 font-bold "
        >
          E-book kezelés
        </button>
        <button
          onClick={() => navigate("/admin/audio")}
          className="bg-yellow-400 hover:bg-yellow-500 text-green-900 py-3 px-6 font-bold "
        >
          Hangoskönyv kezelés
        </button>
        <button
          onClick={() => navigate("/admin/blog")}
          className="bg-yellow-400 hover:bg-yellow-500 text-green-900 py-3 px-6 font-bold "
        >
          Blog kezelés
        </button>
      </div>
    </div>
  );
}
