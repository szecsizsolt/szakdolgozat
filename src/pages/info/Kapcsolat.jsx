import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Kapcsolat = () => {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-10 space-y-6 text-olive-800">
      <h1 className="text-3xl font-bold">Kapcsolat</h1>
      <p>Ha kérdésed van rendeléseddel, termékeinkkel vagy szolgáltatásainkkal kapcsolatban, vedd fel velünk a kapcsolatot az alábbi elérhetőségeken:</p>
      
      <div className="space-y-2">
        <p className="flex items-center gap-2"><FaEnvelope /> info@konyvbolt.hu</p>
        <p className="flex items-center gap-2"><FaPhone /> +36 1 234 5678</p>
        <p className="flex items-center gap-2"><FaMapMarkerAlt /> 1051 Budapest, Fő utca 1.</p>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Kapcsolatfelvételi űrlap</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Név" className="w-full p-2 border rounded" required />
          <input type="email" placeholder="Email" className="w-full p-2 border rounded" required />
          <textarea placeholder="Üzenet" className="w-full p-2 border rounded h-32" required></textarea>
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded">Küldés</button>
        </form>
      </div>
    </div>
  );
};

export default Kapcsolat;
