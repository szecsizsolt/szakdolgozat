import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import placeholderImage from "../assets/peldakonyv.png";

export default function Audio() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchAudioBook = async () => {
      try {
        // Alap könyv adatok lekérése
        const bookRes = await fetch(`http://localhost:3001/books/${id}`);
        if (!bookRes.ok) throw new Error("Könyv nem található");
        const bookData = await bookRes.json();

        // Kapcsolódó hangoskönyv adatok lekérése
        const audioRes = await fetch(`http://localhost:3001/audiobooks/${id}`);
        if (!audioRes.ok) throw new Error("Hangoskönyv nem található");
        const audioData = await audioRes.json();

        // Teljes objektum összeállítása
        const audioBook = {
          title: bookData.title,
          author: bookData.author,
          cover:
            bookData.cover_image_url && bookData.cover_image_url.startsWith("http")
              ? bookData.cover_image_url
              : bookData.cover_image_url
              ? `http://localhost:3001${bookData.cover_image_url}`
              : placeholderImage,
          narrator: audioData.narrator,
          duration: audioData.duration_min,
          audioUrl: `http://localhost:3001${audioData.audio_url}`,
        };

        setBook(audioBook);
      } catch (err) {
        console.error("Hangoskönyv betöltési hiba:", err);
      }
    };

    fetchAudioBook();
  }, [id]);

  if (!book) {
    return (
      <p className="text-center py-10 text-gray-500">
        Hangoskönyv betöltése...
      </p>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* Hangoskönyv lejátszó komponens */}
      <AudioPlayer book={book} />
    </div>
  );
}
