import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { isValid, parseISO } from "date-fns";

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /invoices
 * Query params:
 *  - q (search by invoiceNumber or vendor name)
 *  - status
 *  - vendorId
 *  - from / to (dates)
 *  - sort (e.g., date:asc or total:desc)
 *  - limit, offset
 */
router.get("/", async (req, res) => {
  try {
    const {
      q,
      status,
      vendorId,
      from,
      to,
      sort = "date:desc",
      limit = "25",
      offset = "0",
    } = req.query as Record<string, string>;

    const where: any = {};

    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    if (from || to) {
      where.date = {};
      if (from) {
        const f = parseISO(from);
        if (isValid(f)) where.date.gte = f;
      }
      if (to) {
        const t = parseISO(to);
        if (isValid(t)) where.date.lte = t;
      }
    }

    if (q) {
      // Search vendor name and invoiceNumber
      where.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        {
          vendor: {
            is: { name: { contains: q, mode: "insensitive" } },
          },
        },
      ];
    }

    // Sorting
    const [sortField, sortDir] = (sort || "date:desc").split(":");
    const orderBy: any = {};
    orderBy[sortField] = sortDir === "asc" ? "asc" : "desc";

    const take = Number(limit || 25);
    const skip = Number(offset || 0);

    const [total, data] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: {
          vendor: true,
          customer: true,
        },
        orderBy,
        take,
        skip,
      }),
    ]);

    // Format minimal fields for table
    const rows = data.map(i => ({
      id: i.id,
      vendor: i.vendor?.name ?? "Unknown",
      date: i.date,
      invoiceNumber: i.invoiceNumber,
      amount: Number(i.total),
      status: i.status,
    }));

    res.json({ total, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

export default router;
