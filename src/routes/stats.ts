import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
const prisma = new PrismaClient();
const router = Router();

/**
 * GET /stats
 * Returns totals for overview cards:
 * { totalSpendYTD, totalInvoices, documentsUploaded, avgInvoiceValue }
 */
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const totalSpendYTDRaw = await prisma.invoice.aggregate({
      where: { date: { gte: startOfYear } },
      _sum: { total: true },
    });

    const totalInvoices = await prisma.invoice.count();
    // We didn't create a documents model initially in the schema above.
    // If you have a Document model, use prisma.document.count(). Otherwise return 0.
    const documentsUploaded = ("document" in prisma) ? await (prisma as any).document.count() : 0;

    const avgInvoiceValueRaw = await prisma.invoice.aggregate({
      _avg: { total: true },
    });

    res.json({
      totalSpendYTD: totalSpendYTDRaw._sum.total ?? 0,
      totalInvoices,
      documentsUploaded,
      avgInvoiceValue: avgInvoiceValueRaw._avg.total ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
