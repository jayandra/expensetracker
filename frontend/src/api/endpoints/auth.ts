import { client } from '../http/client';
import type {
  LoginCredentials,
  SignupData,
  PasswordResetData,
  AuthResponse
} from '../../services/auth/types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await client.post('/session', credentials);
  return response.data;
};

export const signup = async (userData: SignupData): Promise<AuthResponse> => {
  const response = await client.post('/users', { user: userData });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await client.delete('/session');
};

export const checkSession = async (): Promise<AuthResponse> => {
  const response = await client.get('/session');
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await client.post(
    '/passwords',
    { email_address: email },
    { withCredentials: false }
  );
};

export const resetPassword = async (data: PasswordResetData): Promise<void> => {
  await client.post(
    '/passwords/reset',
    data,
    { withCredentials: false }
  );
};

// Re-export types for easier access
export type { LoginCredentials, SignupData, PasswordResetData };
