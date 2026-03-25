const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        message: "Backend connected successfully",
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/chart-data", (req, res) => {
    res.json({
        title: "Production Output by Line",
        categories: ["Line A", "Line B", "Line C", "Line D", "Line E"],
        series: [
            {
                name: "Units",
                data: [42, 58, 36, 64, 49],
            },
        ],
        updatedAt: new Date().toISOString(),
    });
});

if (process.env.MONGO_URI && process.env.MONGO_URI !== "your_mongodb_connection_string") {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection failed:", err.message));
} else {
    console.log("MONGO_URI not set. Running without database connection.");
}

app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});