"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const stats_1 = __importDefault(require("./routes/stats"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const vendors_1 = __importDefault(require("./routes/vendors"));
const category_1 = __importDefault(require("./routes/category"));
const invoiceTrends_1 = __importDefault(require("./routes/invoiceTrends"));
const cashOutflow_1 = __importDefault(require("./routes/cashOutflow"));
const chat_1 = __importDefault(require("./routes/chat"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/stats", stats_1.default);
app.use("/invoices", invoices_1.default);
app.use("/vendors/top10", vendors_1.default);
app.use("/category-spend", category_1.default);
app.use("/invoice-trends", invoiceTrends_1.default);
app.use("/cash-outflow", cashOutflow_1.default);
app.use("/chat-with-data", chat_1.default);
app.get("/", (_, res) => res.send("✅ Backend running successfully!"));
app.listen(PORT, () => console.log(`🚀 API ready on port ${PORT}`));
