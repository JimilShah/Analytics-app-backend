import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const invoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: from,
          lte: to,
        },
      },
      select: { date: true, total: true },
    });

    const validInvoices = invoices.filter(
      (inv) => inv.date !== null && inv.total !== null
    );

    const monthlyData: Record<
      string,
      { invoiceCount: number; totalSpend: number }
    > = {};

    for (const inv of validInvoices) {
      const d = new Date(inv.date!);
      const month = d.toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyData[month]) {
        monthlyData[month] = { invoiceCount: 0, totalSpend: 0 };
      }

      monthlyData[month].invoiceCount += 1;
      monthlyData[month].totalSpend += Number(inv.total);
    }

    const result = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      invoiceCount: data.invoiceCount,
      totalSpend: data.totalSpend,
    }));

    res.json(result);
  } catch (err: any) {
    console.error("🔥 Error in /invoice-trends:", err);
    res.status(500).json({
      error: "Failed to fetch invoice trends",
      details: err.message,
    });
  }
});

export default router;
