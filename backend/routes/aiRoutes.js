import express from "express";
import ai from "../utils/gemini.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an expert recruiter and resume analyst.

Analyze the candidate's resume.

${jobDescription
  ? `
Also compare the resume against the following job description.

JOB DESCRIPTION:
${jobDescription}
`
  : ""
}

Rules:
- Only use information actually present in the resume and job description.
- Do not invent qualifications or experience.
- Keep array items concise.
- Be objective and specific.
- If a job description is provided, identify matched and missing skills.
- Calculate a role fit score from 0 to 100 based on skills, experience, projects, and overall relevance.
- Give practical suggestions.

Return the analysis as structured JSON.

RESUME:
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

            roleFitScore: {
              type: "number",
            },

            matchedSkills: {
              type: "array",
              items: {
                type: "string",
              },
            },

            missingSkills: {
              type: "array",
              items: {
                type: "string",
              },
            },

            roleAnalysis: {
              type: "string",
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
            "roleFitScore",
            "matchedSkills",
            "missingSkills",
            "roleAnalysis",
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