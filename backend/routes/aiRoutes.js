import express from "express";
import ai from "../utils/gemini.js";
import calculateATSScore from "../utils/atsScorer.js";
import calculateRoleFitScore from "../utils/roleFitScorer.js";

const router = express.Router();

const MAX_RESUME_TEXT_LENGTH = 30000;
const MAX_JOB_DESCRIPTION_LENGTH = 15000;

const validateInputs = (resumeText, jobDescription) => {
  if (!resumeText || !resumeText.trim()) {
    return "Resume text is required.";
  }

  if (!jobDescription || !jobDescription.trim()) {
    return "Job description is required.";
  }

  if (resumeText.length > MAX_RESUME_TEXT_LENGTH) {
    return "Resume text is too long to process.";
  }

  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return "Job description is too long to process.";
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Resume Analysis
|--------------------------------------------------------------------------
*/

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    const validationError = validateInputs(
      resumeText,
      jobDescription
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const prompt = `
You are an expert recruiter, ATS resume evaluator, and career coach.

Analyze the candidate's resume against the target job description.

Provide a semantic evaluation of the candidate.

Analyze:
- Candidate summary
- Role relevance
- Skills
- Education
- Experience
- Projects
- Certifications
- Strengths
- Weaknesses
- Resume improvement suggestions
- Qualitative ATS issues

IMPORTANT:
- Only use information actually present in the resume and job description.
- Never invent skills, experience, projects, education, or certifications.
- Do NOT calculate the role fit score.
- Do NOT calculate the ATS score.
- Do NOT calculate matched skills or missing skills.
- The backend calculates these values separately.
- Be objective and practical.
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
            "summary",
            "roleAnalysis",
            "atsAnalysis",
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "strengths",
            "weaknesses",
            "suggestions",
            "atsIssues",
          ],
        },
      },
    });

    const analysis = JSON.parse(response.text);

    /*
    |--------------------------------------------------------------------------
    | Deterministic Role Fit Score
    |--------------------------------------------------------------------------
    */

    const roleFitScore = calculateRoleFitScore(
      resumeText,
      jobDescription
    );

    /*
    |--------------------------------------------------------------------------
    | Deterministic ATS Score
    |--------------------------------------------------------------------------
    */

    const atsResult = calculateATSScore(
      resumeText,
      jobDescription
    );

    /*
    |--------------------------------------------------------------------------
    | Add calculated values
    |--------------------------------------------------------------------------
    */

    analysis.roleFitScore = roleFitScore;

    analysis.atsScore = atsResult.score;

    analysis.matchedSkills =
      atsResult.skillsFound;

    analysis.missingSkills =
      atsResult.skillsMissing;

    analysis.atsKeywordsFound =
      atsResult.keywordsFound;

    analysis.atsKeywordsMissing =
      atsResult.keywordsMissing;

    res.status(200).json({
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    console.error(
      "Resume analysis error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to analyze the resume right now. Please try again.",
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

    const validationError = validateInputs(
      resumeText,
      jobDescription
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const prompt = `
You are an expert technical recruiter and professional resume writer.

Improve the candidate's resume specifically for the target job.

IMPORTANT RULES:
- Never invent experience.
- Never invent technologies the candidate has not mentioned.
- Never invent metrics or achievements.
- Preserve the candidate's actual meaning.
- Improve clarity, impact, specificity, and keyword alignment.
- Do not rewrite the entire resume.
- Focus on the highest-value improvements.

Return:

1. An improved professional summary.

2. Up to 5 improved resume bullets based ONLY
   on information already present.

3. Important keywords from the job description
   that the candidate should naturally emphasize
   IF they genuinely have those skills.

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
      message:
        "Resume improvement generated successfully",
      improvement,
    });
  } catch (error) {
    console.error(
      "Resume improvement error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to improve the resume right now. Please try again.",
    });
  }
});

export default router;