import express from "express";
import ai from "../utils/gemini.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an expert resume reviewer.

Analyze the resume below.

Rules:
- Only use information actually present in the resume.
- Do not invent information.
- Keep every array item concise.
- Identify genuine strengths and weaknesses.
- Give practical suggestions for improving the resume.

Resume:
${resumeText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            summary: {
              type: "string",
            },

            skills: {
              type: "array",
              items: {
                type: "string",
              },
            },

            education: {
              type: "array",
              items: {
                type: "string",
              },
            },

            experience: {
              type: "array",
              items: {
                type: "string",
              },
            },

            projects: {
              type: "array",
              items: {
                type: "string",
              },
            },

            certifications: {
              type: "array",
              items: {
                type: "string",
              },
            },

            strengths: {
              type: "array",
              items: {
                type: "string",
              },
            },

            weaknesses: {
              type: "array",
              items: {
                type: "string",
              },
            },

            suggestions: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "summary",
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "strengths",
            "weaknesses",
            "suggestions",
          ],
        },
      },
    });

    const analysis = JSON.parse(response.text);

    res.status(200).json({
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
});

export default router;