import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import PieChartIcon from '@mui/icons-material/PieChart';
import SettingsIcon from '@mui/icons-material/Settings';

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
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname == path;
  };

  const navItems: NavItem[] = [
    { path: '/', icon: <HomeIcon fontSize={isActive('/') ? 'large' : 'medium'} />, label: 'Home' },
    { path: '/expenses', icon: <ReceiptIcon fontSize={isActive('/expenses') ? 'large' : 'medium'} />, label: 'Expenses' },
    { path: '/expenses/new', icon: <AddIcon fontSize={isActive('/expenses/new') ? 'large' : 'medium'} />, label: 'Add' },
    { path: '/categories', icon: <PieChartIcon fontSize={isActive('/categories') ? 'large' : 'medium'} />, label: 'Categories' },
    { path: '/settings', icon: <SettingsIcon fontSize={isActive('/settings') ? 'large' : 'medium'} />, label: 'Settings' },
  ];

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
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive(item.path) ? 'text-primary-600' : 'text-gray-500'
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
