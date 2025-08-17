import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { emitError } from '../services/errorBus';
import { 
  login as loginService, 
  logout as logoutService,
  checkSession as checkSessionService
} from '../services/auth.service';

interface User {
  id: number;
  email: string;
  // Add other user fields as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on initial load
    const checkSession = async () => {
      try {
        const data = await checkSessionService();
        if (data?.user) {
          const u = data.user as any;
          setUser({ id: u.id, email: u.email_address });
        }
      } catch (error: any) {
        // Silently ignore 401 (unauthenticated) during initial probe
        if (error?.status !== 401) {
          console.error('Session check failed:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await loginService(email, password);
      if (!user) {
        // Surface as a global error to keep components free of try/catch
        emitError({ message: 'Invalid response from server' });
        return;
      }
      setUser({ id: user.id, email: user.email_address });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Signup and password reset flows are handled directly in components via auth.service.

  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
