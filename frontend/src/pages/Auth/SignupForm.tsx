import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { emitError } from '../../services/errorBus';
import { signup as signupService } from '../../services/auth.service';
import FormContainer from '../../components/Form/FormContainer';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';

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
    <FormContainer
      title="Create a new account"
      footer={
        <>
          <span className="text-neutral-600">Already have an account? </span>
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </>
      }
    >
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
          
          <FormInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <FormInput
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm Password"
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
            Sign up
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

export default SignupForm;
