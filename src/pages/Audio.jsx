import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import placeholderImage from "../assets/peldakonyv.png";

export default function Audio() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Lejátszás indítása / szüneteltetése
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Aktuális idő frissítése
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  // Némítás kapcsolása
  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Idő formázása mm:ss alakra
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Lejátszási sebesség frissítése
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Hangoskönyv adatok betöltése
  useEffect(() => {
    const fetchAudioBook = async () => {
      try {
        const bookRes = await fetch(`http://localhost:3001/books/${id}`);
        if (!bookRes.ok) throw new Error("Könyv nem található");
        const bookData = await bookRes.json();

        const audioRes = await fetch(`http://localhost:3001/audiobooks/${id}`);
        if (!audioRes.ok) throw new Error("Hangoskönyv nem található");
        const audioData = await audioRes.json();

        setBook({
          title: bookData.title,
          author: bookData.author,
          cover:
            bookData.cover_image_url?.startsWith("http")
              ? bookData.cover_image_url
              : bookData.cover_image_url
              ? `http://localhost:3001${bookData.cover_image_url}`
              : placeholderImage,
          narrator: audioData.narrator,
          duration: audioData.duration_min,
          audioUrl: `http://localhost:3001${audioData.audio_url}`,
        });
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
      <div className="flex flex-col md:flex-row items-start gap-8">
        <img
          src={book.cover}
          alt={book.title}
          className="w-64 h-auto shadow-lg rounded-md"
        />

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-green-900">
              {book.title}
            </h1>
            <p className="text-md text-gray-700">{book.author}</p>
            {book.narrator && (
              <p className="text-sm text-gray-500">
                Narrátor: {book.narrator}
              </p>
            )}
            {book.duration && (
              <p className="text-sm text-gray-500">
                Hossz: {book.duration} perc
              </p>
            )}
          </div>

          <audio
            ref={audioRef}
            src={book.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
            <span>{formatTime(currentTime)}</span>

            <div
              className="w-full mx-4 h-2 bg-gray-300 rounded-full relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;

                if (audioRef.current && duration) {
                  audioRef.current.currentTime = percent * duration;
                }
              }}
            >
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(currentTime / duration) * 100 || 0}%`,
                }}
              />
            </div>

            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex justify-center items-center gap-6 mt-4 text-2xl text-green-900">
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              {speeds.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>

            <FaBackward
              className="cursor-pointer hover:text-green-700"
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 10;
              }}
            />

            <button onClick={togglePlay} className="text-4xl">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <FaForward
              className="cursor-pointer hover:text-green-700"
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime += 10;
              }}
            />

            <button onClick={toggleMute}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
