const Aszf = () => {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-10 text-olive-800 space-y-6">
      <h1 className="text-3xl font-bold">Általános Szerződési Feltételek</h1>

      <p>Az alábbi feltételek vonatkoznak minden vásárlóra, aki webáruházunkból rendel:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>A rendelés leadásával a vásárló elfogadja a jelen feltételeket.</li>
        <li>A termékek ára forintban értendő és tartalmazza az ÁFÁ-t.</li>
        <li>Szállítási idő: 2–4 munkanap, futárszolgálattal.</li>
        <li>Elállási jog: a vásárló 14 napon belül indoklás nélkül visszaküldheti a terméket.</li>
        <li>Panaszkezelés: az <strong>info@konyvbolt.hu</strong> címen keresztül.</li>
      </ul>

      <p>Jelen ÁSZF 2025. január 1-jétől hatályos.</p>
    </div>
  );
};

export default Aszf;
