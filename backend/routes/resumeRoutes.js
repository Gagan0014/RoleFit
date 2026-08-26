import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";

const router = express.Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPE = "application/pdf";

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== ALLOWED_MIME_TYPE) {
      return cb(
        new Error("Only PDF resumes are allowed.")
      );
    }

    cb(null, true);
  },
});

router.post(
  "/upload",
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message:
              "Resume file is too large. Maximum size is 5 MB.",
          });
        }

        return res.status(400).json({
          message: error.message,
        });
      }

      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a resume PDF.",
        });
      }

      if (req.file.mimetype !== ALLOWED_MIME_TYPE) {
        return res.status(400).json({
          message: "Only PDF resumes are allowed.",
        });
      }

      if (!req.file.buffer?.length) {
        return res.status(400).json({
          message: "The uploaded resume is empty.",
        });
      }

      const parser = new PDFParse({
        data: req.file.buffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      const extractedText = result.text?.trim();

      if (!extractedText) {
        return res.status(400).json({
          message:
            "Could not extract text from this PDF. Please upload a text-based PDF resume.",
        });
      }

      res.status(200).json({
        message: "Resume uploaded successfully",
        fileName: req.file.originalname,
        text: extractedText,
      });
    } catch (error) {
      console.error("Resume processing error:", error);

      res.status(500).json({
        message: "Failed to process resume.",
      });
    }
  }
);

export default router;