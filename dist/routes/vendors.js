"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get("/", async (_, res) => {
    try {
        const vendors = await prisma_1.prisma.vendor.findMany({
            include: {
                invoices: { select: { total: true } },
            },
        });
        const result = vendors
            .map(v => ({
            name: v.name,
            totalSpend: v.invoices.reduce((sum, i) => sum + Number(i.total || 0), 0),
        }))
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 10);
        res.json(result);
    }
    catch (err) {
        console.error("Error in /vendors:", err);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
});
exports.default = router;
