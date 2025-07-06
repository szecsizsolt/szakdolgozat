import { getAuth } from "firebase/auth";

/**
 * Könyv hozzáadása a kosárhoz
 * @param {string} bookId - könyv ID
 * @param {number} quantity - mennyiség
 * @param {'physical' | 'ebook' | 'audiobook'} itemType - termék típusa
 */
export async function addToCartBackend(bookId, quantity = 1, itemType = "physical") {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Jelentkezz be a kosár használatához!");
    return;
  }

  try {
    const token = await user.getIdToken();

    const res = await fetch("http://localhost:3001/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        book_id: bookId,
        quantity,
        item_type: itemType, // lehet "physical", "ebook", "audiobook"
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Hiba történt a kosárba rakáskor.");
    }

    return await res.json();
  } catch (err) {
    console.error("Kosárba adás hiba:", err);
    alert("Hiba: " + err.message);
  }
}
