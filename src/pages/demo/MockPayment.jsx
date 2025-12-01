import { Link, useNavigate } from "react-router-dom";

export default function MockPayment() {
  const navigate = useNavigate();

  return (
    <div className="p-10 text-center space-y-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        Demó fizetés
      </h1>
      <p className="text-lg text-gray-700">
        Kérlek válaszd ki, hogy milyen eredménnyel szimuláljuk a fizetést.
      </p>

      <div className="flex flex-col items-center gap-4 mt-8">
        <button
          onClick={() => navigate("/payment/success")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 w-60"
        >
          Sikeres fizetés
        </button>

        <button
          onClick={() => navigate("/payment/fail")}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 w-60"
        >
          Sikertelen fizetés
        </button>

        <Link
          to="/cart"
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-60 text-center"
        >
          Mégse (vissza a kosárhoz)
        </Link>
      </div>
    </div>
  );
}
