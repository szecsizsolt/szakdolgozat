import { useParams } from "react-router-dom";

const blogPosts = [
  {
    id: "1",
    title: "5 könyv, amit nyáron érdemes elolvasni",
    content: `
Ezek a történetek lekötnek a vízparton is – fantasy, krimi és önfejlesztés egy csokorban.
\n\n📘 *A Gyűrűk Ura* – egy klasszikus fantasy utazás.
\n\n📗 *Az alkimista* – motiváló történet az önkeresésről.
\n\n📕 *1984* – elgondolkodtató disztópia.
\n\n📙 *Dűne* – epikus sci-fi világ.
\n\n📓 *A szolgálólány meséje* – társadalmi kérdésekkel foglalkozó történet.
    `,
  },
  {
    id: "2",
    title: "Hogyan válassz könyvet ajándékba?",
    content: `
🎁 Könyvet ajándékozni mindig jó ötlet, de nehéz eltalálni, mi tetszik másnak.
\n\nTippek:
- Figyelj a korosztályra
- Vedd figyelembe a műfajt, amit olvas
- Inspirálódj kedvenc filmjeiből, hobbijaiból
    `,
  },
  {
    id: "3",
    title: "Miért jó papírkönyvet olvasni a képernyő helyett?",
    content: `
📖 A papírkönyv nem csak olvasás, hanem élmény is:
- illata van
- nem fárasztja a szemet
- jobban segíti az elmélyülést
\n\nSokan emiatt választják még mindig a klasszikus formátumot.
    `,
  },
];

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return <div className="max-w-screen-md mx-auto py-20 text-center text-red-700">A bejegyzés nem található.</div>;
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 py-12 text-olive-800">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
      <p className="whitespace-pre-line leading-relaxed">{post.content}</p>
    </div>
  );
};

export default BlogPost;
