import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
const prisma = new PrismaClient();
const router = Router();

/**
 * GET /vendors/top10
 * Returns top 10 vendors by total invoice spend
 */
router.get("/top10", async (req, res) => {
  try {
    // Corrected casing for table names ("Vendor", "Invoice")
    const rows: { id: string; name: string; total_spend: string }[] = await prisma.$queryRawUnsafe(`
      SELECT "Vendor".id, "Vendor".name, COALESCE(SUM("Invoice".total), 0) AS total_spend
      FROM "Invoice"
      JOIN "Vendor" ON "Invoice"."vendorId" = "Vendor".id
      GROUP BY "Vendor".id, "Vendor".name
      ORDER BY total_spend DESC
      LIMIT 10;
    `);

    // Convert numeric strings to numbers
    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      totalSpend: Number(r.total_spend)
    }));

    res.json(result);
  } catch (err) {
    console.error("🔥 Error in /vendors/top10:", err);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

export default router;
