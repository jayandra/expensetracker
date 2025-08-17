import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset as requestPasswordResetService } from '../../services/auth.service';
import AuthLayout from '../../components/Auth/AuthLayout';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!email) {
      // Optional: inline validation without using global banner
      // setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordResetService(email);
      setMessage('If an account exists with this email, you will receive password reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={"Enter your email address and we'll send you a link to reset your password."}
      footer={(
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      )}
    >
      {/* Errors are shown globally via GlobalErrorBanner */}

      {message ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <p>{message}</p>
        </div>
      ) : (
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
                  className="form-input rounded-md"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="form-button"
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
