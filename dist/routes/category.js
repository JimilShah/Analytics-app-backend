"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get("/", async (_, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            include: {
                invoices: {
                    select: { total: true },
                },
            },
        });
        const result = categories.map((c) => ({
            category: c.name,
            totalSpend: c.invoices.reduce((sum, i) => sum + Number(i.total || 0), 0),
        }));
        res.json(result);
    }
    catch (err) {
        console.error("Error in /category-spend:", err);
        res.status(500).json({ error: "Failed to fetch category spend" });
    }
});
exports.default = router;
