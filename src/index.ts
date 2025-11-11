import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import vendorsRouter from "./routes/vendors";
import trendsRouter from "./routes/invoicetrends";
import cashRouter from "./routes/cashOutflow";
import categoryRouter from "./routes/category";
import chatRouter from "./routes/chat";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*" // tighten in production
}));

app.get("/", (req, res) => res.send("API running"));

app.use("/stats", statsRouter);
app.use("/invoices", invoicesRouter);
app.use("/vendors", vendorsRouter);
app.use("/invoice-trends", trendsRouter);
app.use("/cash-outflow", cashRouter);
app.use("/category-spend", categoryRouter);
app.use("/chat-with-data", chatRouter);

// basic error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
