import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems } = req.body;

    console.log("📦 Stripe request items:", cartItems);

    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: "huf",
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(((item.final_price ?? item.price) * 100)),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:5173/payment/success",
      cancel_url: "http://localhost:5173/payment/fail",
    });

    console.log("🔗 Stripe session URL:", session.url);

    res.json({ url: session.url });

  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
