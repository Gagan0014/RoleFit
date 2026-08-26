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

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        message: "Job description is required",
      });
    }

    const prompt = `
You are an expert recruiter, ATS resume evaluator, and career coach.

Analyze the candidate's resume against the target job description.

You must produce TWO separate scores:

1. roleFitScore:
   Measures how well the candidate matches the actual role.
   Consider:
   - Skills
   - Technical requirements
   - Experience
   - Projects
   - Education
   - Overall relevance

2. atsScore:
   Measures how well the resume is optimized for an Applicant Tracking System for this specific job.
   Consider:
   - Important job-description keywords present in the resume
   - Relevant technical skills
   - Clear standard resume sections
   - Specific and searchable terminology
   - Missing important keywords
   - Content clarity and consistency
   - Potential ATS weaknesses visible from the extracted text

Important rules:
- Only use information actually present in the resume and job description.
- Never invent skills, experience, projects, education, or certifications.
- Do not give a high ATS score just because the resume is well written.
- Do not give a high role-fit score simply because keywords match.
- Keep arrays concise and useful.
- Scores must be integers from 0 to 100.
- Be objective and practical.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            roleFitScore: {
              type: "number",
            },

            atsScore: {
              type: "number",
            },

            summary: {
              type: "string",
            },

            roleAnalysis: {
              type: "string",
            },

            atsAnalysis: {
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

            atsKeywordsFound: {
              type: "array",
              items: {
                type: "string",
              },
            },

            atsKeywordsMissing: {
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

            atsIssues: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "roleFitScore",
            "atsScore",
            "summary",
            "roleAnalysis",
            "atsAnalysis",
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "matchedSkills",
            "missingSkills",
            "atsKeywordsFound",
            "atsKeywordsMissing",
            "strengths",
            "weaknesses",
            "suggestions",
            "atsIssues",
          ],
        },
      },
    });

    const analysis = JSON.parse(response.text);

    // Keep scores safely inside the expected range.
    analysis.roleFitScore = Math.min(
      Math.max(Math.round(analysis.roleFitScore), 0),
      100
    );

    analysis.atsScore = Math.min(
      Math.max(Math.round(analysis.atsScore), 0),
      100
    );

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