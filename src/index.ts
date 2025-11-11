import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import statsRoute from "./routes/stats";
import invoicesRoute from "./routes/invoices";
import vendorsRoute from "./routes/vendors";
import categoryRoute from "./routes/category";
import invoiceTrendsRoute from "./routes/invoiceTrends";
import cashOutflowRoute from "./routes/cashOutflow";
import chatRoute from "./routes/chat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/stats", statsRoute);
app.use("/invoices", invoicesRoute);
app.use("/vendors/top10", vendorsRoute);
app.use("/category-spend", categoryRoute);
app.use("/invoice-trends", invoiceTrendsRoute);
app.use("/cash-outflow", cashOutflowRoute);
app.use("/chat-with-data", chatRoute);

app.get("/", (_, res) => res.send("✅ Backend running successfully!"));

app.listen(PORT, () => console.log(`🚀 API ready on port ${PORT}`));
