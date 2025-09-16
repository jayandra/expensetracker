import type { User, AuthResponse, LoginCredentials } from './types';
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
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await apiLogin(credentials);
    // Map email_address to email if needed
    if (data.user && 'email_address' in data.user) {
      const { email_address, ...rest } = data.user as any;
      return { ...data, user: { ...rest, email: email_address } };
    }
    return data;
  },
  signup: apiSignup,
  logout: apiLogout,
  checkSession: async (): Promise<User> => {
    const data = await apiCheckSession();
    // Map email_address to email if needed
    if (data.user && 'email_address' in data.user) {
      const { email_address, ...rest } = data.user as any;
      return { ...rest, email: email_address };
    }
    return data.user;
  },
  requestPasswordReset: apiRequestPasswordReset,
  resetPassword: apiResetPassword
} as const;
