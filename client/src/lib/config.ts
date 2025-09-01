// Environment configuration for consistent user ID across app
export const APP_CONFIG = {
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || 'single-user',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  STORAGE_TYPE: import.meta.env.VITE_STORAGE_TYPE || 'memory'
} as const;

export default APP_CONFIG;
