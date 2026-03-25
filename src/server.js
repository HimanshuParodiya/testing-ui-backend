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

const chartTemplate = {
    title: "Production Output by Line",
    categories: ["Line A", "Line B", "Line C", "Line D", "Line E"],
};

let liveValues = [42, 58, 36, 64, 49];

function buildChartPayload(values) {
    return {
        title: chartTemplate.title,
        categories: chartTemplate.categories,
        series: [
            {
                name: "Units",
                data: values,
            },
        ],
        updatedAt: new Date().toISOString(),
    };
}

function nextLiveValues(values) {
    return values.map((value) => {
        const change = Math.floor(Math.random() * 11) - 5;
        return Math.max(10, Math.min(100, value + change));
    });
}

app.get("/api/chart-stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
    }

    const sendUpdate = () => {
        const payload = buildChartPayload(liveValues);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sendUpdate();

    const intervalId = setInterval(() => {
        liveValues = nextLiveValues(liveValues);
        sendUpdate();
    }, 2500);

    req.on("close", () => {
        clearInterval(intervalId);
        res.end();
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