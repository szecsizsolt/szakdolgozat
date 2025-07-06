import { Link } from "react-router-dom";


const articles = [
  {
    title: "5 könyv, amit nyáron érdemes elolvasni",
    excerpt:
      "Ezek a történetek lekötnek a vízparton is – fantasy, krimi és önfejlesztés egy csokorban.",
  },
  {
    title: "Hogyan válassz könyvet ajándékba?",
    excerpt:
      "Tippek és trükkök a tökéletes ajándékkönyv megtalálásához – életkor, érdeklődési kör, stílus alapján.",
  },
  {
    title: "Miért jó papírkönyvet olvasni a képernyő helyett?",
    excerpt:
      "Az illat, a tapintás, a fókuszálás – ezek miatt választják sokan még mindig a klasszikus könyvet.",
  },
];

const Blog = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-olive-800 mb-10">
        Olvasási tippek és blog
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="bg-white border border-yellow-200 rounded-xl p-6 shadow text-olive-800"
          >
            <h3 className="text-lg font-bold mb-2">{article.title}</h3>
            <p className="text-sm">{article.excerpt}</p>
            <Link
                to={`/blog/${index + 1}`}
                className="mt-4 inline-block text-yellow-600 font-semibold hover:underline"
            >
                Tovább olvasom →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
