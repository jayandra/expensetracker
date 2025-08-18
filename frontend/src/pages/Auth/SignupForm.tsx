import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { emitError } from '../../services/errorBus';
import { signup as signupService } from '../../services/auth.service';
import AuthLayout from '../../components/Auth/AuthLayout';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  // Errors are handled globally via GlobalErrorBanner
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      // Surface as a global error (same banner as failed requests)
      emitError({ status: 400, message: 'Passwords do not match' });
      return;
    }

    try {
      setIsLoading(true);
      await signupService(email, password, passwordConfirmation);
      // After signup, log the user in to establish session/context
      await login(email, password);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create a new account"
      footer={(
        <>
          <span className="text-gray-600">Already have an account? </span>
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </>
      )}
    >
      {/* Errors are shown globally via GlobalErrorBanner */}
      <form onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input form-input-primary rounded-t-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="form-input form-input-primary"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className="sr-only">
                Confirm Password
              </label>
              <input
                id="password-confirm"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                className="form-input form-input-primary rounded-b-md"
                placeholder="Confirm Password"
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
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
    </AuthLayout>
  );
};

export default SignupForm;
