import { Router } from "express";
import { prisma } from "../prisma";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

/**
 * GET /invoice-trends?from=2024-01-01&to=2024-12-31
 * Returns array of { month: '2024-01', invoiceCount, totalSpend }
 */
router.get("/", async (req, res) => {
  try {
    const from = (req.query.from as string) || null;
    const to = (req.query.to as string) || null;

    // Build safe SQL
    const rows: { month: string; invoice_count: number; total_spend: string }[] = await prisma.$queryRaw`
      SELECT
        to_char(date_trunc('month', date), 'YYYY-MM') AS month,
        COUNT(*) AS invoice_count,
        COALESCE(SUM(total),0) AS total_spend
      FROM "Invoice"
      ${from ? prisma.raw`WHERE date >= ${from}` : prisma.raw``}
      ${to ? prisma.raw((from ? ` AND date <= ${to}` : ` WHERE date <= ${to}`)) : prisma.raw``}
      GROUP BY 1
      ORDER BY 1;
    `;

    res.json(rows.map(r => ({ month: r.month, invoiceCount: Number(r.invoice_count), totalSpend: Number(r.total_spend) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

export default router;
