import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /cash-outflow?from=2024-10-01&to=2025-01-31
 * Returns expected outflow per due_date (grouped daily)
 */
router.get("/", async (req, res) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    // Build dynamic WHERE clause safely using Prisma.sql
    const whereClauses: Prisma.Sql[] = [];

    if (from) {
      whereClauses.push(Prisma.sql`COALESCE("dueDate"::date, "date"::date) >= ${from}`);
    }
    if (to) {
      whereClauses.push(Prisma.sql`COALESCE("dueDate"::date, "date"::date) <= ${to}`);
    }

    const whereClause =
      whereClauses.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereClauses, Prisma.sql` AND `)}`
        : Prisma.empty;

    const rows: { due_date: string; expected_outflow: string }[] =
      await prisma.$queryRawUnsafe(`
        SELECT COALESCE("dueDate"::date, "date"::date) AS due_date,
               SUM("total") AS expected_outflow
        FROM "Invoice"
        ${whereClauses.length ? whereClause.text : ""}
        GROUP BY 1
        ORDER BY 1;
      `);

    const formatted = rows.map((r) => ({
      date: r.due_date,
      expectedOutflow: Number(r.expected_outflow) || 0,
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error("🔥 Error in /cash-outflow:", err.message);
    res.status(500).json({ error: "Failed to fetch cash outflow", details: err.message });
  }
});

export default router;
