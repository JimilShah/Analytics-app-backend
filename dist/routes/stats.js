"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get("/", async (_, res) => {
    try {
        const totalSpend = await prisma_1.prisma.invoice.aggregate({ _sum: { total: true } });
        const totalInvoices = await prisma_1.prisma.invoice.count();
        const avgInvoice = await prisma_1.prisma.invoice.aggregate({ _avg: { total: true } });
        res.json({
            totalSpend: totalSpend._sum.total || 0,
            totalInvoices,
            avgInvoice: avgInvoice._avg.total || 0,
        });
    }
    catch (err) {
        console.error("Error in /stats:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});
exports.default = router;
