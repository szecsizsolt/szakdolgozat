// routes/simplepay.js
import express from "express";
const router = express.Router();

router.post("/start", (req, res) => {
  const { total } = req.body;

  // ❗ Nem megy ki SimplePay felé! Csak mock adatot adunk vissza
  const data = {
    merchant: "MOCK_MERCHANT",
    orderRef: `MOCK-${Date.now()}`,
    total: parseInt(total),
  };

  console.log("💡 Mock fizetéshez generált adat:", data);

  res.json(data); // ezt használja majd a frontend a mock fizetési űrlaphoz
});

export default router;
