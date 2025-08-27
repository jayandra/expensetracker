import type { User } from './types';
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  checkSession as apiCheckSession,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword
} from '../../api/endpoints/auth';

// AuthService acts as a thin wrapper around authentication API endpoints.
// Error handling is currently managed by the HTTP interceptor.
// Future enhancements may include:
// - Fine-grained error handling with backend error codes
// - JWT token management
// - Session persistence logic
export const AuthService = {
  login: apiLogin,
  signup: apiSignup,
  logout: apiLogout,
  checkSession: async (): Promise<User> => {
    const data = await apiCheckSession();
    return data.user;
  },
  requestPasswordReset: apiRequestPasswordReset,
  resetPassword: apiResetPassword
} as const;
