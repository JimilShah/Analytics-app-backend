import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Fetch all invoices
    const invoices = await prisma.invoice.findMany({
      select: { date: true, total: true },
    });

    // Filter out invalid ones manually
    const validInvoices = invoices.filter(
      (inv) => inv.date && inv.total
    );

    if (validInvoices.length === 0) {
      console.warn("No valid invoices found for trends");
      return res.json([]);
    }

    // Group by month
    const monthlyData: Record<string, { invoiceCount: number; totalSpend: number }> = {};

    for (const inv of validInvoices) {
      const d = new Date(inv.date!);
      if (isNaN(d.getTime())) continue;

      const month = d.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { invoiceCount: 0, totalSpend: 0 };
      }
      monthlyData[month].invoiceCount += 1;
      monthlyData[month].totalSpend += Number(inv.total) || 0;
    }

    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        invoiceCount: data.invoiceCount,
        totalSpend: data.totalSpend,
      }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

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
