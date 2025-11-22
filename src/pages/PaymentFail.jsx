import { Link } from "react-router-dom";

export default function PaymentFail() {
  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-red-600">Fizetés sikertelen</h1>
      <p className="mt-4 text-lg">
        A tranzakció megszakadt vagy nem sikerült.
      </p>

      <Link
        to="/cart"
        className="text-green-700 font-semibold hover:underline mt-6 inline-block"
      >
        Vissza a kosárhoz
      </Link>
    </div>
  );
}
