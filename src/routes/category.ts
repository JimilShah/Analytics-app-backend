import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        invoices: {
          select: { total: true },
        },
      },
    });

    const result = categories.map((c) => ({
      category: c.name,
      totalSpend: c.invoices.reduce(
        (sum, i) => sum + Number(i.total || 0),
        0
      ),
    }));

    res.json(result);
  } catch (err) {
    console.error("Error in /category-spend:", err);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

export default router;
