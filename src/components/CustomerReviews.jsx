const CustomerReviews = () => {
  const reviews = [
    {
      text: "Nagyon gyors szállítás és gyönyörű könyvek!",
      author: "Anna",
    },
    {
      text: "Tetszik az egyszerű, áttekinthető felület.",
      author: "Bence",
    },
    {
      text: "Régóta kerestem ezt a könyvet, itt megtaláltam!",
      author: "Csilla",
    },
  ];

  return (
    <section className="mt-16 px-4">
      <h2 className="text-2xl font-bold text-center text-olive-800 mb-8">
        Vásárlói vélemények
      </h2>
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white border border-yellow-200 p-6 rounded-2xl shadow-md text-olive-800"
          >
            <p className="italic">"{review.text}"</p>
            <span className="block mt-4 text-right font-semibold">– {review.author}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
