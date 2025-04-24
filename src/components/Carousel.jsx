import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] overflow-hidden rounded-lg shadow-lg">
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
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h3 className="text-xl font-bold">{slide.title}</h3>
            <p className="text-sm">{slide.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Carousel;
