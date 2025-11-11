"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const from = req.query.from ? new Date(req.query.from) : undefined;
        const to = req.query.to ? new Date(req.query.to) : undefined;
        const invoices = await prisma_1.prisma.invoice.findMany({
            where: {
                date: {
                    gte: from,
                    lte: to,
                },
            },
            select: { date: true, total: true },
        });
        const validInvoices = invoices.filter((inv) => inv.date !== null && inv.total !== null);
        const monthlyData = {};
        for (const inv of validInvoices) {
            const d = new Date(inv.date);
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
    }
    catch (err) {
        console.error("🔥 Error in /invoice-trends:", err);
        res.status(500).json({
            error: "Failed to fetch invoice trends",
            details: err.message,
        });
    }
});
exports.default = router;
