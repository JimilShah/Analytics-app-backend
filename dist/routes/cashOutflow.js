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
                OR: [
                    { dueDate: { gte: from, lte: to } },
                    { date: { gte: from, lte: to } },
                ],
            },
            select: { dueDate: true, date: true, total: true },
        });
        const map = {};
        for (const inv of invoices) {
            const key = new Date(inv.dueDate ?? inv.date).toISOString().slice(0, 10);
            map[key] = (map[key] || 0) + Number(inv.total);
        }
        const result = Object.entries(map).map(([date, expectedOutflow]) => ({
            date,
            expectedOutflow,
        }));
        res.json(result);
    }
    catch (err) {
        console.error("Error in /cash-outflow:", err);
        res.status(500).json({ error: "Failed to fetch cash outflow" });
    }
});
exports.default = router;
