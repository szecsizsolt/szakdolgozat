import { getAuth } from "firebase/auth";

// Könyv hozzáadása a kosárhoz backend API-n keresztül
export async function addToCartBackend(
  bookId,
  quantity = 1,
  itemType = "physical"
) {
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
        item_type: itemType,
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.json();
  } catch (err) {
    console.error("Kosárba adás hiba:", err);
    alert("Nem sikerült a kosárba helyezni a terméket.");
  }
}
