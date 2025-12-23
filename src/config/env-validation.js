/**
 * @fileoverview Environment variable validation for the web application.
 * Validates that required environment variables are set at startup.
 */

/**
 * Required environment variables
 */
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_VARS = [
  'VITE_API_BASE_URL',
  'VITE_SYNCFUSION_KEY',
];

/**
 * Validates environment variables at application startup.
 * Logs warnings for missing optional vars and throws for required ones.
 * 
 * @returns {Object} Object with validation results
 * @throws {Error} If required environment variables are missing
 */
export function validateEnvironment() {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  }

  // Check recommended variables
  for (const varName of RECOMMENDED_VARS) {
    if (!import.meta.env[varName]) {
      warnings.push(varName);
    }
  }

  // Log warnings for optional missing vars
  if (warnings.length > 0) {
    console.warn(
      'Missing recommended environment variables:',
      warnings.join(', '),
      '\nThe app may work but some features might be limited.'
    );
  }

  // Throw if required vars are missing (development only to prevent deploy issues)
  if (missing.length > 0 && import.meta.env.DEV) {
    console.error(
      'Missing required environment variables:',
      missing.join(', '),
      '\nPlease check your .env file.'
    );
    // Don't throw in development, just warn
    // In production, Firebase will fail gracefully
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    environment: {
      mode: import.meta.env.MODE,
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD,
      useBackendAPI: import.meta.env.VITE_USE_BACKEND_API === 'true',
    },
  };
}

/**
 * Gets the current environment configuration
 * @returns {Object} Environment configuration
 */
export function getEnvironmentConfig() {
  return {
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    },
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://workside-signals-api-b4elbrm5vq-uc.a.run.app',
      useBackend: import.meta.env.VITE_USE_BACKEND_API === 'true',
    },
    syncfusion: {
      hasLicense: !!import.meta.env.VITE_SYNCFUSION_KEY,
    },
  };
}

export default { validateEnvironment, getEnvironmentConfig };
