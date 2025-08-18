import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset as requestPasswordResetService } from '../../services/auth.service';
import FormContainer from '../../components/Form/FormContainer';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';

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
    <FormContainer
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <>
          <span className="text-neutral-600">Remember your password? </span>
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </>
      }
    >
      {message ? (
        <div className="bg-success-100 border-l-4 border-success-500 text-success-700 p-4 mb-6 rounded" role="alert">
          <p className="text-sm">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormInput
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center"
            >
              Send reset instructions
            </Button>
          </div>
        </form>
      )}
    </FormContainer>
  );
};

export default ForgotPasswordForm;
