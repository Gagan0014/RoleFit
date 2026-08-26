<div align="center">

# RoleFit

**AI-Powered Resume & Job Role Matching**

Upload a resume, paste a job description, and get an objective view of your role fit, ATS readiness, skill gaps, and practical resume improvements.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://role-fit-phi.vercel.app/)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)

**[🚀 Try RoleFit](https://role-fit-phi.vercel.app/)**

</div>

---

## Overview

RoleFit is a full-stack AI application built to help candidates tailor their resumes to specific job opportunities.

The application combines:

- **Deterministic backend scoring** for Role Fit and ATS evaluation
- **Google Gemini** for semantic resume analysis
- **PDF text extraction** for resume processing
- **AI-powered resume improvement** for actionable changes

Instead of returning only a generic resume score, RoleFit explains *what matches* the role, *what is missing*, and *how the resume can be improved*.

---

## Features

### 📄 Resume Upload & Parsing
- PDF-only resume upload
- Maximum file size: 5 MB
- Backend file validation
- PDF text extraction
- Invalid and empty PDF handling

### 🎯 Role Fit Score

Calculated by the backend using weighted matching:

| Factor | Weight |
|---|---|
| Technical skill match | 40% |
| Experience relevance | 25% |
| Project relevance | 20% |
| Requirement coverage | 15% |

### 🤖 ATS Score

Calculated independently from the AI response, using deterministic matching rather than asking the LLM to generate the numeric score:

| Factor | Weight |
|---|---|
| Keyword coverage | 40% |
| Technical skill match | 30% |
| Resume section coverage | 15% |
| Resume completeness | 15% |

### 🔎 Resume Analysis

RoleFit provides:

- Resume summary
- Role analysis
- Matched skills
- Missing skills
- ATS keywords found
- ATS keywords missing
- Strengths
- Weaknesses
- ATS issues
- Recommendations

### ✍️ AI Resume Improvement

The application can generate:

- Improved professional summary
- Improved resume bullets
- Keyword suggestions
- Action items

The AI is explicitly instructed **not** to fabricate:

- Experience
- Technologies
- Achievements
- Metrics
- Qualifications

---

## Architecture

```
                           RoleFit
                              │
                              ▼
                    ┌──────────────────┐
                    │   React + Vite   │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                             │ HTTP
                             ▼
                    ┌──────────────────┐
                    │ Express Backend  │
                    └────────┬─────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
      PDF Text Parser   RoleFit Scorer   ATS Scorer
             │               │               │
             └───────────────┼───────────────┘
                             │
                             ▼
                       Gemini API
                             │
                             ▼
                  Semantic Resume Analysis
                             │
                             ▼
                    Resume Improvement
```

### Design Approach

RoleFit separates **objective scoring** from **LLM reasoning**.

**Deterministic backend logic handles:**
- Role Fit score
- ATS score
- Skill matching
- Keyword matching
- Resume section checks
- Completeness checks

**Gemini handles:**
- Semantic role analysis
- Strengths & weaknesses
- ATS issues
- Recommendations
- Resume improvement

This keeps the numeric scoring reproducible while still using the LLM where semantic reasoning adds value.

---

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- Multer
- PDF parsing
- express-rate-limit

**AI**
- Google Gemini API
- Structured JSON responses

**Deployment**
- Vercel — Frontend
- Render — Backend

---

## Project Structure

```
RoleFit/
│
├── backend/
│   ├── config/
│   │   └── env.js
│   │
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   └── resumeRoutes.js
│   │
│   ├── utils/
│   │   ├── atsScorer.js
│   │   ├── roleFitScorer.js
│   │   └── gemini.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## API Endpoints

### Upload Resume
```
POST /api/resume/upload
Content-Type: multipart/form-data

resume: resume.pdf
```

### Analyze Resume
```
POST /api/ai/analyze
Content-Type: application/json

{
  "resumeText": "Extracted resume text...",
  "jobDescription": "Target job description..."
}
```

### Improve Resume
```
POST /api/ai/improve
Content-Type: application/json

{
  "resumeText": "Extracted resume text...",
  "jobDescription": "Target job description..."
}
```

---

## Security & Validation

- PDF-only upload validation
- 5 MB file-size limit
- Empty/invalid PDF checks
- Resume text length limits
- Job description length limits
- CORS restriction
- API rate limiting
- Environment variable validation
- Server-side Gemini API key
- User-friendly API errors
- Frontend request timeouts

---

## Run Locally

### Prerequisites
- Node.js
- npm
- Google Gemini API key

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/RoleFit.git
cd RoleFit
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Run:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`

### 3. Frontend

Open another terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

Run:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Deployment

### Frontend — Vercel

**Live:** [https://role-fit-phi.vercel.app/](https://role-fit-phi.vercel.app/)

Environment variable:
```
VITE_API_URL=https://YOUR-RENDER-BACKEND-URL
```

- Build command: `npm run build`
- Output directory: `dist`

### Backend — Render

Environment variables:
```
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://role-fit-phi.vercel.app
```

- Build command: `npm install`
- Start command: `npm start`

---

## Current Limitations

RoleFit currently does not include:

- User authentication
- Saved analysis history
- User accounts
- Payment functionality
- Resume database storage
- A proprietary company's ATS algorithm

> The ATS score is an ATS-style heuristic and is **not** intended to reproduce the proprietary scoring system of Workday, Greenhouse, LinkedIn, or any other specific ATS.

---

## Future Improvements

- Better semantic job requirement extraction
- Improved experience and seniority matching
- Resume formatting analysis
- Downloadable optimized resumes
- Resume version comparison
- User authentication
- User dashboard
- Interview question generation
- Production monitoring and analytics

---

## Why RoleFit?

Traditional resume tools often stop at:

> "Your resume score is 78."

RoleFit is designed to answer:

```
How well do I fit this role?
            ↓
What skills do I match?
            ↓
What skills am I missing?
            ↓
What ATS keywords are missing?
            ↓
What should I improve?
            ↓
How can my resume be rewritten?
```

---

## Author

**Gagan Pathak**

Built with React, Node.js, Express, PDF parsing, deterministic scoring algorithms, and Google Gemini.

<div align="center">

**[🚀 Try RoleFit](https://role-fit-phi.vercel.app/)**

</div>
