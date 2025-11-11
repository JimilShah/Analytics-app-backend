import { Router } from "express";
import { prisma } from "../prisma";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

/**
 * GET /category-spend
 *
 * Our current schema does not include categories. If you have a Category model,
 * you should adapt this query. As a fallback, this groups spend by the first
 * word of line item description (very rough). You should later add a Category model.
 */
router.get("/", async (req, res) => {
  try {
    // If Category exists - use it
    if ("category" in prisma) {
      const rows = await prisma.$queryRaw`SELECT c.name, COALESCE(SUM(li.total),0) AS total_spend
        FROM "LineItem" li
        JOIN "Category" c ON li.categoryId = c.id
        GROUP BY c.name ORDER BY total_spend DESC;`;
      return res.json(rows);
    }

    // Fallback grouping by first word of description
    const rows: { cat: string; total_spend: string }[] = await prisma.$queryRaw`
      SELECT split_part(description, ' ', 1) AS cat, COALESCE(SUM(total),0) AS total_spend
      FROM "LineItem"
      GROUP BY cat
      ORDER BY total_spend DESC
      LIMIT 10;
    `;
    res.json(rows.map(r => ({ category: r.cat, totalSpend: Number(r.total_spend) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

export default router;
