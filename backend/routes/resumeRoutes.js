import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No resume uploaded",
      });
    }

    const parser = new PDFParse({
      data: req.file.buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    res.status(200).json({
      message: "Resume uploaded successfully",
      fileName: req.file.originalname,
      text: result.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to process resume",
    });
  }
});

export default router;