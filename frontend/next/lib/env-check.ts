export function checkEnvironmentVariables() {
    const requiredVariables = [
      "NEON_DATABASE_URL",
      "NEXTAUTH_SECRET",
    //   "NEXTAUTH_URL",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    ]
  
    const missingVariables = requiredVariables.filter((variable) => !process.env[variable])
  
    if (missingVariables.length > 0) {
      console.warn("Warning: The following environment variables are missing:", missingVariables.join(", "))
    }
  }
  
  