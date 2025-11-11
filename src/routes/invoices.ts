import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const search = (req.query.search as string) || "";

    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { vendor: { name: { contains: search, mode: "insensitive" } } },
          { invoiceNumber: { contains: search, mode: "insensitive" } },
        ],
      },
      include: { vendor: true },
      orderBy: { date: "desc" },
    });

    res.json(invoices);
  } catch (err) {
    console.error("Error in /invoices:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

export default router;
