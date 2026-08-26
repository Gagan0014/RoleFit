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

2. atsScore:
   Measures how well the resume is optimized for an Applicant Tracking System for this specific job.

Important rules:
- Only use information actually present in the resume and job description.
- Never invent skills, experience, projects, education, or certifications.
- Do not give a high ATS score simply because the resume is well written.
- Do not give a high role-fit score simply because keywords match.
- Scores must be integers from 0 to 100.
- Keep arrays concise and useful.

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

/*
|--------------------------------------------------------------------------
| Resume Improvement
|--------------------------------------------------------------------------
*/

router.post("/improve", async (req, res) => {
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
You are an expert technical recruiter and professional resume writer.

Your task is to improve the candidate's resume specifically for the target job.

Important rules:
- Never invent experience.
- Never invent technologies the candidate has not mentioned.
- Never invent metrics or achievements.
- Preserve the candidate's actual meaning.
- Improve clarity, impact, specificity, and keyword alignment.
- Suggestions should be actionable.
- Do not rewrite the entire resume.
- Focus on the highest-value improvements.

Return:
1. An improved professional summary.
2. Up to 5 improved resume bullets based ONLY on information already present.
3. Important keywords from the job description that the candidate should naturally emphasize IF they genuinely have those skills.
4. Specific action items for improving the resume.

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
            improvedSummary: {
              type: "string",
            },

            improvedBullets: {
              type: "array",
              items: {
                type: "string",
              },
            },

            keywordSuggestions: {
              type: "array",
              items: {
                type: "string",
              },
            },

            actionItems: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "improvedSummary",
            "improvedBullets",
            "keywordSuggestions",
            "actionItems",
          ],
        },
      },
    });

    const improvement = JSON.parse(response.text);

    res.status(200).json({
      message: "Resume improvement generated successfully",
      improvement,
    });
  } catch (error) {
    console.error("Resume improvement error:", error);

    res.status(500).json({
      message: "Failed to improve resume",
      error: error.message,
    });
  }
});

export default router;