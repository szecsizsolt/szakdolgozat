const Adatvedelem = () => {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-10 text-olive-800 space-y-6">
      <h1 className="text-3xl font-bold">Adatvédelmi tájékoztató</h1>

      <p>Webáruházunk kiemelten fontosnak tartja vásárlóink személyes adatainak védelmét. Az alábbiakban ismertetjük, hogyan kezeljük a megadott adatokat:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Adataidat csak a rendelés teljesítése érdekében kérjük be és tároljuk.</li>
        <li>Az adatokat harmadik félnek nem adjuk ki, kivéve a szállításhoz szükséges információkat.</li>
        <li>Bármikor kérheted adataid módosítását vagy törlését ügyfélszolgálatunkon keresztül.</li>
        <li>Oldalunk cookie-kat használ a felhasználói élmény javításához.</li>
      </ul>

      <p>További információkért kérjük, vedd fel velünk a kapcsolatot: <strong>info@konyvbolt.hu</strong></p>
    </div>
  );
};

export default Adatvedelem;
