const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "our",
  "are",
  "will",
  "have",
  "has",
  "been",
  "being",
  "into",
  "about",
  "their",
  "they",
  "them",
  "then",
  "than",
  "who",
  "what",
  "when",
  "where",
  "which",
  "while",
  "would",
  "should",
  "could",
  "must",
  "can",
  "may",
  "might",
  "not",
  "job",
  "role",
  "work",
  "team",
  "teams",
  "experience",
  "experiences",
  "years",
  "year",
  "using",
  "use",
  "used",
  "build",
  "building",
  "develop",
  "developing",
  "development",
  "responsibilities",
  "requirements",
  "required",
  "preferred",
  "strong",
  "good",
  "knowledge",
  "skills",
  "skill",
  "ability",
  "ensure",
  "including",
  "include",
  "includes",
  "across",
  "other",
  "etc",
  "work",
  "working",
  "application",
  "applications",
  "candidate",
  "candidates",
  "looking",
  "seeking",
  "environment",
  "environments",
  "provide",
  "providing",
  "support",
  "supporting",
  "responsible",
  "based",
  "related",
  "relevant",
  "excellent",
  "great",
  "high",
  "well",
  "within",
  "through",
  "such",
  "also",
  "both",
  "more",
  "most",
  "some",
  "any",
  "all",
  "each",
  "their",
  "our",
  "new",
  "join",
  "help",
  "make",
  "across",
]);

const COMMON_TECH_TERMS = [
  "javascript",
  "typescript",
  "react.js",
  "react",
  "angular",
  "vue.js",
  "vue",
  "next.js",
  "nextjs",
  "node.js",
  "node",
  "express.js",
  "express",
  "nestjs",
  "mongodb",
  "mysql",
  "postgresql",
  "sql",
  "java",
  "python",
  "c++",
  "c#",
  "spring boot",
  "spring",
  "django",
  "flask",
  "php",
  "laravel",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "git",
  "github",
  "gitlab",
  "rest api",
  "rest apis",
  "restful api",
  "restful apis",
  "graphql",
  "redis",
  "kafka",
  "jenkins",
  "terraform",
  "linux",
  "html",
  "css",
  "tailwind css",
  "tailwind",
  "mern",
  "mean",
  "full stack",
  "full-stack",
  "microservices",
  "api",
  "apis",
  "redux",
  "jwt",
  "oauth",
  "ci/cd",
  "cicd",
];

const SECTION_PATTERNS = {
  summary: /\b(summary|professional summary|profile|objective)\b/i,

  skills:
    /\b(skills|technical skills|core competencies|technologies|tech stack)\b/i,

  experience:
    /\b(experience|work experience|employment|professional experience)\b/i,

  education:
    /\b(education|academic background|qualifications)\b/i,

  projects:
    /\b(projects|personal projects|academic projects|key projects)\b/i,

  certifications:
    /\b(certifications|certificates|credentials|achievements)\b/i,
};

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^\w\s+#./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenize = (text = "") => {
  return normalizeText(text)
    .replace(/[.+/#-]/g, " ")
    .split(" ")
    .filter(Boolean);
};

const normalizeTermTokens = (term = "") => {
  return tokenize(term);
};

/*
|--------------------------------------------------------------------------
| Exact term matching
|--------------------------------------------------------------------------
|
| This avoids problems such as:
|
| "java" matching "javascript"
|
| and handles multi-word terms like:
|
| "node.js"
| "rest api"
|
|--------------------------------------------------------------------------
*/

const containsTerm = (text, term) => {
  const textTokens = tokenize(text);
  const termTokens = normalizeTermTokens(term);

  if (!termTokens.length) {
    return false;
  }

  if (termTokens.length > textTokens.length) {
    return false;
  }

  for (
    let i = 0;
    i <= textTokens.length - termTokens.length;
    i++
  ) {
    let match = true;

    for (let j = 0; j < termTokens.length; j++) {
      if (textTokens[i + j] !== termTokens[j]) {
        match = false;
        break;
      }
    }

    if (match) {
      return true;
    }
  }

  return false;
};

/*
|--------------------------------------------------------------------------
| Remove redundant aliases
|--------------------------------------------------------------------------
|
| Example:
| If the JD contains "Node.js", don't also treat "Node" as a
| separate keyword.
|--------------------------------------------------------------------------
*/

const removeRedundantTerms = (terms) => {
  const uniqueTerms = [
    ...new Set(
      terms.map((term) => normalizeText(term))
    ),
  ];

  return uniqueTerms.filter((term, index) => {
    const termTokens = normalizeTermTokens(term);

    return !uniqueTerms.some((otherTerm, otherIndex) => {
      if (index === otherIndex) {
        return false;
      }

      const otherTokens = normalizeTermTokens(otherTerm);

      if (otherTokens.length <= termTokens.length) {
        return false;
      }

      for (
        let i = 0;
        i <= otherTokens.length - termTokens.length;
        i++
      ) {
        let same = true;

        for (let j = 0; j < termTokens.length; j++) {
          if (otherTokens[i + j] !== termTokens[j]) {
            same = false;
            break;
          }
        }

        if (same) {
          return true;
        }
      }

      return false;
    });
  });
};

const extractTechnicalTerms = (jobDescription) => {
  const technicalTerms = COMMON_TECH_TERMS.filter(
    (term) => containsTerm(jobDescription, term)
  );

  return removeRedundantTerms(technicalTerms);
};

const extractKeywords = (jobDescription) => {
  const words = tokenize(jobDescription)
    .filter((word) => word.length >= 4)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word) => !/^\d+$/.test(word));

  const frequencies = {};

  for (const word of words) {
    frequencies[word] =
      (frequencies[word] || 0) + 1;
  }

  return Object.entries(frequencies)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
};

const calculateKeywordScore = (
  resumeText,
  jobDescription
) => {
  const technicalTerms =
    extractTechnicalTerms(jobDescription);

  const repeatedKeywords =
    extractKeywords(jobDescription);

  const keywords = removeRedundantTerms([
    ...technicalTerms,
    ...repeatedKeywords,
  ]);

  if (!keywords.length) {
    return {
      score: 100,
      found: [],
      missing: [],
    };
  }

  const found = keywords.filter((keyword) =>
    containsTerm(resumeText, keyword)
  );

  const missing = keywords.filter(
    (keyword) => !containsTerm(resumeText, keyword)
  );

  const score = Math.round(
    (found.length / keywords.length) * 100
  );

  return {
    score,
    found,
    missing,
  };
};

const calculateSkillScore = (
  resumeText,
  jobDescription
) => {
  const technicalTerms =
    extractTechnicalTerms(jobDescription);

  if (!technicalTerms.length) {
    return {
      score: 100,
      found: [],
      missing: [],
    };
  }

  const found = technicalTerms.filter((skill) =>
    containsTerm(resumeText, skill)
  );

  const missing = technicalTerms.filter(
    (skill) => !containsTerm(resumeText, skill)
  );

  const score = Math.round(
    (found.length / technicalTerms.length) * 100
  );

  return {
    score,
    found,
    missing,
  };
};

const calculateSectionScore = (resumeText) => {
  const sections =
    Object.values(SECTION_PATTERNS);

  const foundSections = sections.filter(
    (pattern) => pattern.test(resumeText)
  ).length;

  return Math.round(
    (foundSections / sections.length) * 100
  );
};

const calculateCompletenessScore = (
  resumeText
) => {
  const text = resumeText.trim();

  let score = 0;

  if (text.length >= 800) {
    score += 25;
  } else if (text.length >= 500) {
    score += 20;
  } else if (text.length >= 300) {
    score += 15;
  } else if (text.length >= 150) {
    score += 8;
  }

  if (/@/.test(text)) {
    score += 15;
  }

  if (
    /\b(phone|mobile|contact)\b|\+?\d[\d\s-]{7,}/i.test(
      text
    )
  ) {
    score += 15;
  }

  if (SECTION_PATTERNS.skills.test(text)) {
    score += 15;
  }

  if (SECTION_PATTERNS.education.test(text)) {
    score += 10;
  }

  if (SECTION_PATTERNS.experience.test(text)) {
    score += 10;
  }

  if (SECTION_PATTERNS.projects.test(text)) {
    score += 10;
  }

  return Math.min(score, 100);
};

const calculateATSScore = (
  resumeText,
  jobDescription
) => {
  const keywordResult =
    calculateKeywordScore(
      resumeText,
      jobDescription
    );

  const skillResult =
    calculateSkillScore(
      resumeText,
      jobDescription
    );

  const sectionScore =
    calculateSectionScore(resumeText);

  const completenessScore =
    calculateCompletenessScore(resumeText);

  const score = Math.round(
    keywordResult.score * 0.4 +
      skillResult.score * 0.3 +
      sectionScore * 0.15 +
      completenessScore * 0.15
  );

  return {
    score,
    keywordScore: keywordResult.score,
    skillScore: skillResult.score,
    sectionScore,
    completenessScore,

    keywordsFound:
      keywordResult.found,

    keywordsMissing:
      keywordResult.missing,

    skillsFound:
      skillResult.found,

    skillsMissing:
      skillResult.missing,
  };
};

export default calculateATSScore;