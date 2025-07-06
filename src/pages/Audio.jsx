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
        // 1. Lekérjük az alapkönyv-adatokat
        const bookRes = await fetch(`http://localhost:3001/books/${id}`);
        const bookData = await bookRes.json();

        // 2. Lekérjük az audiobooks rekordot (book_id alapján)
        const audioRes = await fetch(`http://localhost:3001/audiobooks/${id}`);
        const audioData = await audioRes.json();

        // 3. Összeállítjuk a végső objektumot
        const audioBook = {
          title: bookData.title,
          author: bookData.author,
          cover: bookData.cover_image_url || placeholderImage,
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
    return <p className="text-center py-10 text-gray-500">Hangoskönyv betöltése...</p>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <AudioPlayer book={book} />
    </div>
  );
}
