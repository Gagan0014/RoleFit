const TECH_TERMS = [
  "javascript",
  "typescript",
  "react",
  "react.js",
  "angular",
  "vue",
  "vue.js",
  "next.js",
  "nextjs",
  "node",
  "node.js",
  "express",
  "express.js",
  "nestjs",
  "mongodb",
  "mysql",
  "postgresql",
  "sql",
  "java",
  "python",
  "c++",
  "c#",
  "spring",
  "spring boot",
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
  "tailwind",
  "tailwind css",
  "mern",
  "mean",
  "redux",
  "jwt",
  "oauth",
  "microservices",
  "ci/cd",
  "cicd",
];

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
  "not",
  "job",
  "role",
  "work",
  "team",
  "experience",
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
  "required",
  "requirements",
  "preferred",
  "strong",
  "good",
  "knowledge",
  "skills",
  "skill",
  "candidate",
  "candidates",
  "looking",
  "seeking",
  "ability",
  "responsibilities",
]);

const normalize = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^\w\s+#./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenize = (text = "") => {
  return normalize(text)
    .replace(/[.+/#-]/g, " ")
    .split(" ")
    .filter(Boolean);
};

const containsTerm = (text, term) => {
  const textTokens = tokenize(text);
  const termTokens = tokenize(term);

  if (!termTokens.length) {
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

const extractTechnicalTerms = (jobDescription) => {
  return TECH_TERMS.filter((term) =>
    containsTerm(jobDescription, term)
  );
};

const extractSection = (resumeText, sectionNames) => {
  const text = resumeText;

  const startPattern = new RegExp(
    `(?:${sectionNames.join("|")})`,
    "i"
  );

  const match = startPattern.exec(text);

  if (!match) {
    return "";
  }

  const startIndex = match.index + match[0].length;

  const nextSectionPattern =
    /\n\s*(summary|profile|objective|skills|technical skills|experience|work experience|professional experience|education|projects|personal projects|certifications|certificates)\s*:?\s*\n?/gi;

  nextSectionPattern.lastIndex = startIndex;

  const nextMatch =
    nextSectionPattern.exec(text);

  if (!nextMatch) {
    return text.slice(startIndex);
  }

  return text.slice(startIndex, nextMatch.index);
};

const extractYears = (text) => {
  const matches = [
    ...text.matchAll(
      /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/gi
    ),
  ];

  if (!matches.length) {
    return null;
  }

  return Math.max(
    ...matches.map((match) => Number(match[1]))
  );
};

const calculateSkillMatch = (
  resumeText,
  jobDescription
) => {
  const requiredSkills =
    extractTechnicalTerms(jobDescription);

  if (!requiredSkills.length) {
    return 50;
  }

  const matchedSkills =
    requiredSkills.filter((skill) =>
      containsTerm(resumeText, skill)
    );

  return Math.round(
    (matchedSkills.length / requiredSkills.length) *
      100
  );
};

const calculateExperienceMatch = (
  resumeText,
  jobDescription
) => {
  const requiredYears =
    extractYears(jobDescription);

  const resumeYears =
    extractYears(resumeText);

  const experienceSection =
    extractSection(resumeText, [
      "experience",
      "work experience",
      "professional experience",
      "employment",
    ]);

  if (requiredYears !== null) {
    if (resumeYears === null) {
      return experienceSection ? 50 : 25;
    }

    return Math.min(
      Math.round(
        (resumeYears / requiredYears) * 100
      ),
      100
    );
  }

  return experienceSection ? 85 : 40;
};

const calculateProjectRelevance = (
  resumeText,
  jobDescription
) => {
  const projectSection =
    extractSection(resumeText, [
      "projects",
      "personal projects",
      "academic projects",
      "key projects",
    ]);

  if (!projectSection.trim()) {
    return 45;
  }

  const requiredSkills =
    extractTechnicalTerms(jobDescription);

  if (!requiredSkills.length) {
    return 70;
  }

  const matchedSkills =
    requiredSkills.filter((skill) =>
      containsTerm(projectSection, skill)
    );

  return Math.round(
    (matchedSkills.length / requiredSkills.length) *
      100
  );
};

const calculateRequirementCoverage = (
  resumeText,
  jobDescription
) => {
  const jobWords = tokenize(jobDescription);

  const uniqueKeywords = [
    ...new Set(
      jobWords.filter(
        (word) =>
          word.length >= 5 &&
          !STOP_WORDS.has(word) &&
          !/^\d+$/.test(word)
      )
    ),
  ];

  if (!uniqueKeywords.length) {
    return 50;
  }

  const matched = uniqueKeywords.filter((word) =>
    containsTerm(resumeText, word)
  );

  return Math.round(
    (matched.length / uniqueKeywords.length) * 100
  );
};

const calculateRoleFitScore = (
  resumeText,
  jobDescription
) => {
  const skillMatch = calculateSkillMatch(
    resumeText,
    jobDescription
  );

  const experienceMatch =
    calculateExperienceMatch(
      resumeText,
      jobDescription
    );

  const projectRelevance =
    calculateProjectRelevance(
      resumeText,
      jobDescription
    );

  const requirementCoverage =
    calculateRequirementCoverage(
      resumeText,
      jobDescription
    );

  const score = Math.round(
    skillMatch * 0.4 +
      experienceMatch * 0.25 +
      projectRelevance * 0.2 +
      requirementCoverage * 0.15
  );

  return Math.min(
    Math.max(score, 0),
    100
  );
};

export default calculateRoleFitScore;