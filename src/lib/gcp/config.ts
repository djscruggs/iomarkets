/**
 * Google Cloud Platform Configuration
 *
 * Manages environment variables and configuration for GCP services
 */

export interface GCPConfig {
  projectId: string;
  region: string;
  credentials: string;
  storageBucket: string;
  dataStoreIdPrefix: string;
  geminiModelName: string;
}

/**
 * Load and validate GCP configuration from environment variables
 */
export function getGCPConfig(): GCPConfig {
  const config: GCPConfig = {
    projectId: process.env.GCP_PROJECT_ID || '',
    region: process.env.GCP_REGION || 'us-central1',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    storageBucket: process.env.CLOUD_STORAGE_BUCKET || '',
    dataStoreIdPrefix: process.env.DATA_STORE_ID_PREFIX || 'iomarkets-dd-',
    geminiModelName: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp',
  };

  // Validate required fields
  const requiredFields: (keyof GCPConfig)[] = [
    'projectId',
    'credentials',
    'storageBucket',
  ];

  const missing = requiredFields.filter(field => !config[field]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required GCP configuration: ${missing.join(', ')}. ` +
      `Please check your .env.local file.`
    );
  }

  return config;
}

/**
 * Generate a data store ID for an investment
 */
export function getDataStoreId(investmentId: string): string {
  const config = getGCPConfig();
  return `${config.dataStoreIdPrefix}${investmentId}`;
}

/**
 * Get GCS folder path for an investment
 */
export function getGCSFolderPath(investmentId: string): string {
  return `investments/${investmentId}/`;
}

/**
 * Get full GCS URI for a document
 */
export function getGCSUri(investmentId: string, filename: string): string {
  const config = getGCPConfig();
  return `gs://${config.storageBucket}/${getGCSFolderPath(investmentId)}${filename}`;
}
