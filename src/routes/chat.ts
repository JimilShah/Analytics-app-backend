import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const vannaURL = process.env.VANNA_API_BASE_URL;
    if (!vannaURL) {
      return res.status(500).json({ error: "Vanna service not configured." });
    }

    const response = await fetch(`${vannaURL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: req.body.query }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in /chat-with-data:", err);
    res.status(500).json({ error: "Failed to contact Vanna service" });
  }
});

export default router;
