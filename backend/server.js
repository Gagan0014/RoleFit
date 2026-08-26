import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import validateEnvironment from "./config/env.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

validateEnvironment();

const app = express();

const allowedOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "RoleFit backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});