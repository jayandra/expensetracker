import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import PieChartIcon from '@mui/icons-material/PieChart';
import SettingsIcon from '@mui/icons-material/Settings';

import type { ReactNode } from 'react';

interface ExpenseItem {
  id: number;
  category: string;
  amount: number;
  icon: ReactNode;
  color: string;
}

interface Transaction {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
}

const Dashboard = () => {
  useAuth(); // User data can be used for future features
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  const expenseSummary: ExpenseItem[] = [
    { id: 1, category: 'Shopping', amount: 1200, icon: <ShoppingCartIcon />, color: 'primary' },
    { id: 2, category: 'Food', amount: 850, icon: <FastfoodIcon />, color: 'success' },
    { id: 3, category: 'Grocery', amount: 450, icon: <LocalGroceryStoreIcon />, color: 'warning' },
    { id: 4, category: 'Others', amount: 300, icon: <LocalMallIcon />, color: 'secondary' },
  ];

  const recentTransactions: Transaction[] = [
    { id: 1, name: 'Grocery Store', amount: 120.00, category: 'Grocery', date: 'Today', type: 'expense' },
    { id: 2, name: 'Salary', amount: 2500.00, category: 'Income', date: 'Yesterday', type: 'income' },
    { id: 3, name: 'Restaurant', amount: 45.50, category: 'Food', date: 'Yesterday', type: 'expense' },
    { id: 4, name: 'Shopping', amount: 89.99, category: 'Shopping', date: '2 days ago', type: 'expense' },
    { id: 5, name: 'Electric Bill', amount: 85.00, category: 'Utilities', date: '3 days ago', type: 'expense' },
    { id: 6, name: 'Freelance Work', amount: 500.00, category: 'Income', date: '4 days ago', type: 'income' },
    { id: 7, name: 'Coffee Shop', amount: 12.50, category: 'Food', date: '4 days ago', type: 'expense' },
    { id: 8, name: 'Bookstore', amount: 32.99, category: 'Shopping', date: '5 days ago', type: 'expense' },
    { id: 9, name: 'Gas Station', amount: 45.75, category: 'Transportation', date: '5 days ago', type: 'expense' },
    { id: 10, name: 'Bonus', amount: 200.00, category: 'Income', date: '1 week ago', type: 'income' },
    { id: 11, name: 'Lunch', amount: 18.75, category: 'Food', date: '1 week ago', type: 'expense' },
    { id: 12, name: 'Clothing', amount: 75.50, category: 'Shopping', date: '1 week ago', type: 'expense' },
  ];

  const navItems: NavItem[] = [
    { id: 'home', icon: <HomeIcon fontSize="large" />, label: 'Home' },
    { id: 'transactions', icon: <ReceiptIcon fontSize="large" />, label: 'Transactions' },
    { id: 'add', icon: <AddIcon fontSize="large" />, label: 'Add' },
    { id: 'stats', icon: <PieChartIcon fontSize="large" />, label: 'Stats' },
    { id: 'settings', icon: <SettingsIcon fontSize="large" />, label: 'Settings' },
  ];

  const getTotalExpenses = (): number => {
    return expenseSummary.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-neutral-50">
      <div className="flex-1 pb-1">
        <div className="max-w-6xl mx-auto w-full px-4">
          {/* Period Selector */}
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-neutral-900">Expense Overview</h1>
            <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
              {(['day', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedPeriod === period 
                      ? 'bg-primary-100 text-primary-600 font-medium' 
                      : 'text-neutral-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Balance */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold">${(2500 - getTotalExpenses()).toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <AccountBalanceWalletIcon className="text-primary-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-success-600 flex items-center">
                <span>↑ 12% from last month</span>
              </div>
            </div>

            {/* Monthly Budget */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">Monthly Budget</p>
                  <p className="text-2xl font-bold">$2,500.00</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                  <ReceiptIcon className="text-success-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                  <div className="bg-success-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">65% of budget used</p>
              </div>
            </div>

            {/* Biggest Expense */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">Biggest Expense</p>
                  <p className="text-2xl font-bold">$1,200</p>
                  <p className="text-xs text-neutral-500">Shopping</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                  <ShoppingCartIcon className="text-warning-600" />
                </div>
              </div>
            </div>

            {/* Savings Goal */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">Savings Goal</p>
                  <p className="text-2xl font-bold">$1,500</p>
                  <p className="text-xs text-neutral-500">${(2500 - getTotalExpenses()).toFixed(2)} saved</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <PieChartIcon className="text-secondary-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-neutral-900">Expense Categories</h2>
              <button className="text-xs text-primary-600">See All</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {expenseSummary.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                    item.color === 'primary' ? 'bg-primary-50 text-primary-600' :
                    item.color === 'success' ? 'bg-success-50 text-success-600' :
                    item.color === 'warning' ? 'bg-warning-50 text-warning-600' :
                    'bg-secondary-50 text-secondary-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="text-sm text-neutral-500">{item.category}</div>
                  <div className="font-semibold">${item.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Transactions</h2>
              <button className="text-xs text-primary-600">See All</button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center bg-white rounded-xl p-3 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                    transaction.type === 'income' ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
                  }`}>
                    {transaction.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{transaction.name}</div>
                    <div className="text-xs text-neutral-500">{transaction.category} • {transaction.date}</div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-1 bottom-0 left-0 right-0 border-t border-neutral-200 shadow-sm">
        <div className="max-w-6xl mx-auto bg-white px-4">
          <nav className="flex justify-between">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-center p-2 ${activeTab === item.id ? 'transform -translate-y-1' : ''} transition-transform duration-200`}
              >
                <span className={`p-3 ${
                  activeTab === item.id 
                    ? 'bg-primary-100 rounded-lg' 
                    : 'hover:bg-neutral-100 rounded-full'
                }`}>
                  {item.icon}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
