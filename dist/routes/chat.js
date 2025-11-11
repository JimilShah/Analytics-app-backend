"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const vannaURL = process.env.VANNA_API_BASE_URL;
        if (!vannaURL) {
            return res.status(500).json({ error: "Vanna service not configured." });
        }
        const response = await (0, node_fetch_1.default)(`${vannaURL}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: req.body.query }),
        });
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        console.error("Error in /chat-with-data:", err);
        res.status(500).json({ error: "Failed to contact Vanna service" });
    }
});
exports.default = router;
