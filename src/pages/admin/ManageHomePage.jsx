import { useEffect, useState } from "react";

export default function AdminHomepage() {
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
  });

  // Slide-ok betöltése
  const fetchSlides = () => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then(setSlides)
      .catch((err) => console.error("Slide betöltési hiba:", err));
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Új slide hozzáadása
  const addSlide = async () => {
    try {
      await fetch("/api/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlide),
      });

      setNewSlide({
        title: "",
        description: "",
        image_url: "",
        link_url: "",
      });

      fetchSlides();
    } catch (err) {
      console.error("Slide hozzáadási hiba:", err);
    }
  };

  // Slide törlése
  const deleteSlide = async (id) => {
    try {
      await fetch(`/api/homepage/${id}`, { method: "DELETE" });
      fetchSlides();
    } catch (err) {
      console.error("Slide törlési hiba:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Főoldal karusszel kezelése</h1>

      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Cím"
          className="border p-2 w-full"
          value={newSlide.title}
          onChange={(e) =>
            setNewSlide({ ...newSlide, title: e.target.value })
          }
        />

        <textarea
          placeholder="Leírás"
          className="border p-2 w-full"
          value={newSlide.description}
          onChange={(e) =>
            setNewSlide({ ...newSlide, description: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Kép URL"
          className="border p-2 w-full"
          value={newSlide.image_url}
          onChange={(e) =>
            setNewSlide({ ...newSlide, image_url: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Link URL"
          className="border p-2 w-full"
          value={newSlide.link_url}
          onChange={(e) =>
            setNewSlide({ ...newSlide, link_url: e.target.value })
          }
        />

        <button
          onClick={addSlide}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Slide hozzáadása
        </button>
      </div>

      <ul>
        {slides.map((s) => (
          <li key={s.id} className="flex justify-between border-b py-2">
            <div>
              <strong>{s.title}</strong> – <em>{s.link_url}</em>
            </div>
            <button
              onClick={() => deleteSlide(s.id)}
              className="text-red-500"
            >
              Törlés
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
