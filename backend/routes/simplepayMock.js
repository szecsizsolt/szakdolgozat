// backend/routes/simplepayMock.js
import express from "express";
const router = express.Router();

router.post("/mock-prepare", (req, res) => {
  console.log("👉 Mock fizetésre kapott adatok:", req.body);

  const { merchant, orderRef, total, signature } = req.body || {};

  if (!merchant) {
    return res.status(400).send("❌ Hibás kérés – nincs paymentData!");
  }

  res.send(`
    <html>
      <head><meta charset="utf-8"><title>Mock SimplePay</title></head>
      <body style="font-family: Arial; padding: 30px;">
        <h2>💳 Mock SimplePay Fizetési Oldal</h2>
        <p><strong>Megrendelés azonosító:</strong> ${orderRef}</p>
        <p><strong>Összeg:</strong> ${total} Ft</p>

        <form method="GET" action="${process.env.SIMPLEPAY_SUCCESS}">
          <button type="submit" style="padding:10px 20px; background:green; color:white;"> Fizetés sikeres</button>
        </form>

        <form method="GET" action="${process.env.SIMPLEPAY_FAIL}">
          <button type="submit" style="padding:10px 20px; background:red; color:white; margin-top:10px;"> Fizetés sikertelen</button>
        </form>
      </body>
    </html>
  `);
});

export default router;
