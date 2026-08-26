const requiredEnvVariables = [
  "GEMINI_API_KEY",
  "FRONTEND_URL",
];

const validateEnvironment = () => {
  const missingVariables = requiredEnvVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    console.error(
      `Missing environment variables: ${missingVariables.join(", ")}`
    );

    process.exit(1);
  }
};

export default validateEnvironment;