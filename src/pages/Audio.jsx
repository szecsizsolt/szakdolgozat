import AudioPlayer from "../components/AudioPlayer";
import placeholderImage from "../assets/peldakonyv.png"; // ugyanaz a placeholder

const dummyBook = {
  title: "A Gyűrűk Ura - Hangoskönyv",
  author: "J.R.R. Tolkien",
  cover: placeholderImage,
};

export default function Audio() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <AudioPlayer book={dummyBook} />
    </div>
  );
}
