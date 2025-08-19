/**
 * Type definitions for the password manager application
 * These serve as documentation for the expected data structures
 */

// User types
export const UserType = {
  id: 'number',
  email: 'string',
  created_at: 'string',
  is_2fa_enabled: 'boolean',
  last_login: 'string'
};

// Password types
export const PasswordType = {
  id: 'number',
  site_name: 'string',
  site_url: 'string',
  username: 'string',
  encrypted_password: 'string',
  category: 'string',
  is_favorite: 'boolean',
  tags: 'string',
  created_at: 'string',
  updated_at: 'string'
};

// API Response types
export const ApiResponseType = {
  success: 'boolean',
  data: 'any',
  message: 'string',
  error: 'string'
};

// Security types
export const SecurityAnalysisType = {
  weak_passwords: 'number',
  reused_passwords: 'number',
  old_passwords: 'number',
  security_score: 'number',
  recommendations: 'array'
};