import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { resetPassword as resetPasswordService } from '../../services/auth.service';
import AuthLayout from '../../components/Auth/AuthLayout';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token is valid when the component mounts
    const checkToken = async () => {
      try {
        await axios.get(`/passwords/${token}/edit`, { withCredentials: true });
        setIsValidToken(true);
      } catch (err) {
        setIsValidToken(false);
        setError('This password reset link is invalid or has expired.');
      }
    };

    if (token) {
      checkToken();
    } else {
      setIsValidToken(false);
      setError('Invalid password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear local validation error only
    setError('');
    
    if (password !== passwordConfirmation) {
      return setError("Passwords don't match");
    }

    if (!token) return;

    setIsLoading(true);

    try {
      await resetPasswordService(token, password, passwordConfirmation);

      setMessage('Your password has been reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle={error}
        footer={(
          <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Request a new password reset link
          </a>
        )}
      >
        {/* No form when invalid; message shown above */}
        <></>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Please enter your new password below."
    >
      {/* Global request errors are displayed via GlobalErrorBanner. Local errors below are for validation/token state. */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {message ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="form-input form-input-primary rounded-t-md"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="password-confirm"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="form-input form-input-primary rounded-b-md"
                placeholder="Confirm new password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="form-button form-button-primary"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordForm;
