import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#f8f4db] shadow-md py-6">
      <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center">
        <div className="max-w-xs">
          <h3 className="text-lg font-bold mb-2">📚 KönyvBolt</h3>
          <p>
            A legjobb könyvek egy helyen. Klasszikusok, újdonságok és akciók —
            minden olvasónak!
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">🔗 Hasznos linkek</h3>
          <ul className="space-y-1">
            <li>
              <Link to="/kapcsolat" className="hover:underline">
                Kapcsolat
              </Link>
            </li>
            <li>
              <Link to="/gyik" className="hover:underline">
                GYIK
              </Link>
            </li>
            <li>
              <Link to="/adatvedelem" className="hover:underline">
                Adatvédelem
              </Link>
            </li>
            <li>
              <Link to="/aszf" className="hover:underline">
                ÁSZF
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">📞 Elérhetőségek</h3>
          <ul className="space-y-1">
            <li>📧 info@konyvbolt.hu</li>
            <li>📱 +36 1 234 5678</li>
            <li>📍 1051 Budapest, Fő utca 1.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
