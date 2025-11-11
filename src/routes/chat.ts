import { Router } from "express";
import { prisma } from "../prisma";
import fetch from "node-fetch";
const router = Router();

/**
 * POST /chat-with-data
 * Body: { query: string }
 * Proxy to Vanna AI service. For now this is a stub that returns a 501 if VANNA not configured.
 */
router.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query is required" });

  const VANNA = process.env.VANNA_API_BASE_URL;
  const VANNA_KEY = process.env.VANNA_API_KEY;

  if (!VANNA) {
    return res.status(501).json({
      error: "Vanna service not configured. Set VANNA_API_BASE_URL in env.",
      sampleSQL: "SELECT COUNT(*) FROM \"Invoice\" WHERE date >= NOW() - INTERVAL '90 days';",
    });
  }

  try {
    const resp = await fetch(`${VANNA}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: VANNA_KEY ? `Bearer ${VANNA_KEY}` : "" },
      body: JSON.stringify({ query, schema_hint: "Vendor(id,name), Invoice(id,invoiceNumber,vendorId,date,total,status), LineItem(...)" }),
    });
    const json = await resp.json();
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to contact Vanna service" });
  }
});

export default router;
