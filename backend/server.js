import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import resumeRoutes from "./routes/resumeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({
    message: "RoleFit backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});