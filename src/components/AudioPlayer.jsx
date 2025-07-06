import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute} from "react-icons/fa";


export default function AudioPlayer({ book }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);


  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };
  const toggleMute = () => {
  if (audioRef.current) {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }
};

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSpeedToggle = () => {
    const newSpeed = speed === 1 ? 1.5 : 1;
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Frissíti a sebességet újrakezdés után is
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      {/* Book Cover */}
      <img
        src={book.cover}
        alt={book.title}
        className="w-64 h-auto shadow-lg rounded-md"
      />

      {/* Audio Player */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">{book.title}</h1>
          <p className="text-md text-gray-700">{book.author}</p>
          {book.narrator && <p className="text-sm text-gray-500">Narrátor: {book.narrator}</p>}
          {book.duration && <p className="text-sm text-gray-500">Hossz: {book.duration} perc</p>}
        </div>

        {/* Audio element */}
      <audio
        ref={audioRef}
        src={book.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
          <span>{formatTime(currentTime)}</span>

          <div
            className="w-full mx-4 h-2 bg-gray-300 rounded-full relative cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const width = rect.width;
              const percent = clickX / width;
              if (audioRef.current && duration) {
                audioRef.current.currentTime = percent * duration;
              }
            }}
          >
            <div
              className="h-full bg-green-500"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            ></div>
          </div>

          <span>{formatTime(duration)}</span>
        </div>


        {/* Controls */}
        <div className="flex justify-center items-center gap-6 mt-4 text-2xl text-green-900">
          <select
  value={speed}
  onChange={(e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }}
  className="text-sm border rounded px-2 py-1"
>
  {speeds.map((s) => (
    <option key={s} value={s}>
      {s}x
    </option>
  ))}
</select>

          <FaBackward className="cursor-pointer hover:text-green-700" onClick={() => {
            if (audioRef.current) audioRef.current.currentTime -= 10;
          }} />
          <button onClick={togglePlay} className="text-4xl">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <FaForward className="cursor-pointer hover:text-green-700" onClick={() => {
            if (audioRef.current) audioRef.current.currentTime += 10;
          }} />
          <button onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>
      </div>
    </div>
  );
}
