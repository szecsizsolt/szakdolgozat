import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import BooksImage1 from "../assets/ChatGPT Image 2025. okt. 16. 18_17_04.png";
import BooksImage2 from "../assets/Névtelen.png";
import BooksImage3 from "../assets/Névtelen2.png";

export default function Carousel() {
  const [slides, setSlides] = useState([
    {
      id: "ebooks",
      title: "E-könyvek akcióban!",
      description: "Olvass kedvezményesen, bárhol, bármikor.",
      image_url: BooksImage1,
      link_url: "/ebooks",
    },
    {
      id: "books",
      title: "Fedezd fel az új könyveket!",
      description: "Friss megjelenések és klasszikusok egy helyen.",
      image_url: BooksImage2,
      link_url: "/books",
    },
    {
      id: "audio",
      title: "Hangoskönyvek útközben",
      description: "Hallgasd kedvenceidet bárhol.",
      image_url: BooksImage3,
      link_url: "/audio",
    },
  ]);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (paused || slides.length === 0) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const prev = () => setCurrent((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setCurrent((i) => (i + 1) % slides.length);

  return (
    <div className="w-full flex justify-center mt-6">
      <div
        className="relative w-[1200px] max-w-full h-[300px] sm:h-[400px] overflow-hidden rounded-2xl shadow-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            // csak az aktív slide legyen kattintható; a többin tiltjuk a pointert
            style={{ pointerEvents: i === current ? "auto" : "none" }}
            onClick={() => nav(s.link_url)}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer
                        ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            aria-label={`${s.title} – kattints a megnyitáshoz`}
            role="button"
          >
            <img src={s.image_url} alt={s.title} className="object-cover w-full h-full" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
              <h3 className="text-lg sm:text-xl font-bold">{s.title}</h3>
              <p className="text-sm sm:text-base">{s.description}</p>
            </div>
          </div>
        ))}

        {/* Nyilak: magas z-index + stopPropagation, így nem a slide kattintása fut le */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Előző"
          className="absolute top-1/2 left-4 -translate-y-1/2 z-50
                     bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full"
        >
          <FaChevronLeft size={20} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Következő"
          className="absolute top-1/2 right-4 -translate-y-1/2 z-50
                     bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full"
        >
          <FaChevronRight size={20} />
        </button>

        {/* Pöttyök */}
        <div className="absolute bottom-3 w-full flex justify-center gap-2 z-50">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`w-3 h-3 rounded-full transition
                         ${i === current ? "bg-white" : "bg-gray-400/70"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
