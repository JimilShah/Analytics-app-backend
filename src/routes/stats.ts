import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_, res) => {
  try {
    const totalSpend = await prisma.invoice.aggregate({ _sum: { total: true } });
    const totalInvoices = await prisma.invoice.count();
    const avgInvoice = await prisma.invoice.aggregate({ _avg: { total: true } });

    res.json({
      totalSpend: totalSpend._sum.total || 0,
      totalInvoices,
      avgInvoice: avgInvoice._avg.total || 0,
    });
  } catch (err) {
    console.error("Error in /stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
