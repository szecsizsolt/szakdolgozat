import { useState } from "react";
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp } from "react-icons/fa";

export default function AudioPlayer({ book }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [speed, setSpeed] = useState(1);

  const chapters = ["Chapter 1", "Chapter 2", "Chapter 3"];

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      {/* Book Cover */}
      <img
        src={book.cover}
        alt={book.title}
        className="w-64 h-auto shadow-lg rounded-md"
      />

      {/* Audio Player UI */}
      <div className="flex-1 space-y-6">
        {/* Title and Author */}
        <div>
          <h1 className="text-3xl font-bold text-green-900">{book.title}</h1>
          <p className="text-md text-gray-700">{book.author}</p>
        </div>

        {/* Progress Bar with time */}
        <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
          <span>00:00</span>
          <div className="w-full mx-4 h-2 bg-gray-300 rounded-full overflow-hidden relative">
            <div className="h-full bg-green-500 w-1/3"></div>
          </div>
          <span>03:45</span>
        </div>

        {/* Controls - középre igazítva */}
        <div className="flex justify-center items-center gap-6 mt-4 text-2xl text-green-900">
          <button onClick={() => setSpeed(speed === 1 ? 1.5 : 1)} className="text-sm px-2 py-1 border rounded">
            {speed}x
          </button>
          <FaBackward className="cursor-pointer hover:text-green-700" />
          <button onClick={togglePlay} className="text-4xl">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <FaForward className="cursor-pointer hover:text-green-700" />
          <FaVolumeUp className="cursor-pointer hover:text-green-700" />
        </div>

        {/* Chapters */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Fejezetek</h3>
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => setCurrentChapter(index)}
                className={`block w-full text-left px-4 py-2 rounded ${
                  currentChapter === index ? "bg-yellow-300" : ""
                } hover:bg-yellow-100`}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
