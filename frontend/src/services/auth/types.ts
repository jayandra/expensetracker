export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email_address: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  password_confirmation: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
