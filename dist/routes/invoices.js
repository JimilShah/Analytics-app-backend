"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const search = req.query.search || "";
        const invoices = await prisma_1.prisma.invoice.findMany({
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
    }
    catch (err) {
        console.error("Error in /invoices:", err);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});
exports.default = router;
