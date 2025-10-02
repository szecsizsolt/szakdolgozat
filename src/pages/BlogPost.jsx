import { useParams } from "react-router-dom";

// Blogposztok (később külön data/blogPosts.js fájlba is kikerülhetnek)
const blogPosts = [
  {
    id: "1",
    title: "5 könyv, amit nyáron érdemes elolvasni",
    content: `
Ezek a történetek lekötnek a vízparton is – fantasy, krimi és önfejlesztés egy csokorban.

* A Gyűrűk Ura – egy klasszikus fantasy utazás
* Az alkimista – motiváló történet az önkeresésről
* 1984 – elgondolkodtató disztópia
* Dűne – epikus sci-fi világ
* A szolgálólány meséje – társadalmi kérdésekkel foglalkozó történet
    `,
  },
  {
    id: "2",
    title: "Hogyan válassz könyvet ajándékba?",
    content: `
Könyvet ajándékozni mindig jó ötlet, de nehéz eltalálni, mi tetszik másnak.

Tippek:
- Figyelj a korosztályra
- Vedd figyelembe a műfajt, amit olvas
- Inspirálódj kedvenc filmjeiből, hobbijaiból
    `,
  },
  {
    id: "3",
    title: "Miért jó papírkönyvet olvasni a képernyő helyett?",
    content: `
A papírkönyv nem csak olvasás, hanem élmény is:
- illata van
- nem fárasztja a szemet
- jobban segíti az elmélyülést

Sokan emiatt választják még mindig a klasszikus formátumot.
    `,
  },
];

const BlogPost = () => {
  const { id } = useParams();

  // Kiválasztott bejegyzés megkeresése
  const post = blogPosts.find((p) => p.id === id);

  // Ha nincs találat
  if (!post) {
    return (
      <div className="max-w-screen-md mx-auto py-20 text-center text-red-700">
        A bejegyzés nem található.
      </div>
    );
  }

  // Megjelenítés
  return (
    <div className="max-w-screen-md mx-auto px-4 py-12 text-olive-800">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
      <p className="whitespace-pre-line leading-relaxed">{post.content}</p>
    </div>
  );
};

export default BlogPost;
