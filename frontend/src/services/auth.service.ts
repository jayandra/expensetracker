import axios from './axios.defaults';

export const login = async (email_address: string, password: string) => {
  const response = await axios.post(
    `/session`,
    { email_address, password }
  );
  return response.data;
};

export const signup = async (email_address: string, password: string, password_confirmation: string) => {
  const response = await axios.post(
    `/users`,
    { 
      user: {
        email_address,
        password,
        password_confirmation
      }
    },
  );
  return response.data;
};

export const logout = async () => {
  await axios({
    method: 'delete',
    url: `/session`
  });
};

export const checkSession = async () => {
  const response = await axios.get(`/sessions/check`);
  return response.data;
};

// Password reset request (forgot password)
export const requestPasswordReset = async (email: string) => {
  const response = await axios.post(
    `/passwords`,
    { email_address: email },
    { withCredentials: false }
  );
  return response.data;
};

// Reset password with token
export const resetPassword = async (token: string, password: string, passwordConfirmation: string) => {
  const response = await axios.post(
    `/passwords/reset`,
    { 
      token,
      password,
      password_confirmation: passwordConfirmation 
    },
    { withCredentials: false }
  );
  return response.data;
};
