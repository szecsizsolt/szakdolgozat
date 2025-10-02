import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import bannerImageYellow from "../assets/pelda1.png";
import bannerImageBlue from "../assets/pelda2.png";
import bannerImageOrange from "../assets/pelda3.png";

const slides = [
  {
    id: 1,
    title: "Újdonság: Elveszett város",
    description: "Fedezd fel a legújabb kalandregényt, tele rejtéllyel és izgalommal!",
    image: bannerImageYellow,
    link: "/books",
  },
  {
    id: 2,
    title: "Tavaszi akciók",
    description: "Most minden második könyv 50% kedvezménnyel!",
    image: bannerImageBlue,
    link: "/sales",
  },
  {
    id: 3,
    title: "Hangoskönyv ajánlat",
    description: "Hallgasd kedvenceidet útközben is, most 2-t fizetsz 3-at vihetsz!",
    image: bannerImageOrange,
    link: "/audio",
  },
];

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatikus váltás
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div
      className="relative w-full h-[350px] sm:h-[450px] overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Diák */}
      {slides.map((slide, index) => (
        <Link
          to={slide.link}
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
            <h3 className="text-xl font-bold">{slide.title}</h3>
            <p className="text-sm">{slide.description}</p>
          </div>
        </Link>
      ))}

      {/* Navigáció gombok */}
      <button
        onClick={prevSlide}
        aria-label="Előző"
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Következő"
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        <FaChevronRight />
      </button>

      {/* Pötty indikátorok */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-white" : "bg-gray-400"
            }`}
            aria-label={`Ugrás a(z) ${index + 1}. diára`}
          />
        ))}
      </div>
    </div>
  );
}
