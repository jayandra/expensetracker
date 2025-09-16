import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FormContainer from '../../components/Form/FormContainer';
import FormInput from '../../components/Form/FormInput';
import Button from '../../components/Form/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <FormContainer
      title="Sign in to your account"
      footer={
        <>
          <span className="text-neutral-600">Don't have an account? </span>
          <Link
            to="/react/signup"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="remember" value="true" />
        
        <div className="space-y-4">
          <FormInput
            label=""
            id="email_address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <FormInput
            label=""
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link
              to="/react/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            isLoading={loading}
            className="w-full justify-center"
          >
            Sign in
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

export default LoginForm;
