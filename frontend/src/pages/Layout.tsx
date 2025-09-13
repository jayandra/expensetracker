import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import PieChartIcon from '@mui/icons-material/PieChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  path: string;
  icon: ReactNode;
  label: string;
}

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export default function Layout({ children, header }: LayoutProps) {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/react') {
      return (location.pathname === '/react' ||
        location.pathname === '/react/dashboard'
      );
    }
    if (path === '/react/categories') {
      return (
        location.pathname === '/react/categories' ||
        location.pathname === '/react/categories/new' ||
        /^\/react\/categories\/\d+\/edit$/.test(location.pathname)
      );
    }
    if (path === '/react/expenses') {
      return (
        location.pathname === '/react/expenses' ||
        /^\/react\/expenses\/\d+\/edit$/.test(location.pathname)
      );
    }
    return location.pathname === path;
  };

  const navItems: NavItem[] = [
    { path: '/react', icon: <HomeIcon fontSize={isActive('/react') ? 'large' : 'medium'} />, label: 'Home' },
    { path: '/react/expenses', icon: <ReceiptIcon fontSize={isActive('/react/expenses') ? 'large' : 'medium'} />, label: 'Expenses' },
    { path: '/react/expenses/new', icon: <AddIcon fontSize={isActive('/react/expenses/new') ? 'large' : 'medium'} />, label: 'Add' },
    { path: '/react/categories', icon: <PieChartIcon fontSize={isActive('/react/categories') ? 'large' : 'medium'} />, label: 'Categories' },
    { path: '#', icon: <LogoutIcon fontSize="medium" />, label: 'Logout' },
  ];

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
  };

  return (
    <div className="min-h-screen min-w-[320px] flex flex-col bg-gray-50">
      <div className="w-full flex-1">
        <div className="w-full mx-auto p-2 md:p-4
          min-w-[320px] sm:min-w-[640px]
          md:min-w-[768px]
          lg:max-w-4xl lg:min-w-[1024px]
          xl:max-w-4xl xl:min-w-[1024px]
          2xl:max-w-4xl 2xl:min-w-[1024px]">
          {header && <div className="mb-6">{header}</div>}
          {children}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="w-full mx-auto px-4
          min-w-[320px] sm:min-w-[640px]
          md:min-w-[768px]
          lg:max-w-4xl lg:min-w-[1024px]
          xl:max-w-4xl xl:min-w-[1024px]
          2xl:max-w-4xl 2xl:min-w-[1024px]">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.path === '#' ? handleLogout : undefined}
                className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${
                  isActive(item.path) && item.path !== '#' ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                {index === 2 ? (
                  <div className={`flex items-center justify-center w-14 h-14 -mt-6 rounded-full text-white shadow-lg ${isActive(item.path) ? 'bg-success-500' : 'bg-success-300'}`}>
                    {item.icon}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div>
                      {item.icon}
                    </div>
                    <span className="text-xs mt-1">{item.label}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="h-20"></div> {/* Spacer for bottom nav */}
    </div>
  );
}
