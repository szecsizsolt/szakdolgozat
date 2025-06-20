import { useState } from "react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Itt lehetne backend POST kérés majd
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="mt-16 px-4 text-center">
      <h2 className="text-2xl font-bold mb-2 text-olive-800">📬 Iratkozz fel hírlevelünkre</h2>
      <p className="mb-4 text-gray-700">Értesülj az újdonságokról és akciókról elsőként!</p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Email címed"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-l-full border border-gray-300 focus:ring-2 focus:ring-yellow-400 w-full"
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-r-full font-semibold"
          >
            Feliratkozom
          </button>
        </form>
      ) : (
        <p className="text-green-700 font-semibold">Köszönjük! Sikeresen feliratkoztál. ✅</p>
      )}
    </section>
  );
};

export default NewsletterSignup;
