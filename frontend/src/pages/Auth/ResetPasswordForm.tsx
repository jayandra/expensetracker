import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthService } from '../../services/auth/auth.service';
import FormContainer from '../../components/Form/FormContainer';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';

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
      await AuthService.resetPassword({ token, password, password_confirmation: passwordConfirmation });

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <FormContainer
        title="Invalid Link"
        subtitle={error}
        footer={
          <a href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
            Request a new password reset link
          </a>
        }
      >
        <div className="text-center">
          <p className="text-sm text-neutral-600">The password reset link is invalid or has expired.</p>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer
      title="Reset your password"
      subtitle="Please enter your new password below."
    >
      {message ? (
        <div className="bg-success-100 border-l-4 border-success-500 text-success-700 p-4 mb-6 rounded" role="alert">
          <p className="text-sm">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-100 border-l-4 border-error-500 text-error-700 p-4 rounded" role="alert">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <FormInput
              label=""
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <FormInput
              label=""
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center"
            >
              Reset Password
            </Button>
          </div>
        </form>
      )}
    </FormContainer>
  );
};

export default ResetPasswordForm;
