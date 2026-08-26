import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({
    message: "RoleFit backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});