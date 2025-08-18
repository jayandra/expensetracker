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
      footer={(
        <>
          <span className="text-gray-600">Remember your password? </span>
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to login
          </Link>
        </>
      )}
    >
      {message ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
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
                className="form-input form-input-primary rounded-md"
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
              className="form-button form-button-primary"
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
