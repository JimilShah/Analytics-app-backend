import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: { select: { total: true } },
      },
    });

    const result = vendors
      .map(v => ({
        name: v.name,
        totalSpend: v.invoices.reduce((sum, i) => sum + Number(i.total || 0), 0),
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    res.json(result);
  } catch (err) {
    console.error("Error in /vendors:", err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

export default router;
