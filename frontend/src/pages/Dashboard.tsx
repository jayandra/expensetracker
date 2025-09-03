import { useState, useMemo } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte } from '@tanstack/db'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { emitError } from '../services/errorBus';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import PieChartIcon from '@mui/icons-material/PieChart';
import SettingsIcon from '@mui/icons-material/Settings';
import type { ReactNode } from 'react';
import { expensesCollection, type Expense } from '../db';

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'month':
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  }, [selectedPeriod]);

const {
  data: filteredExpenses = [],
  isLoading,
  isError
} = useLiveQuery(
  (q) => {
    const query = q
      .from({ expenses: expensesCollection })
      .where(({ expenses }) =>
        and(
          gte(expenses.date, dateRange.start.toISOString()),
          lte(expenses.date, dateRange.end.toISOString())
        )
      );

    return query.select(({ expenses }) => ({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      category_id: expenses.category_id,
      date: expenses.date,
      user_id: expenses.user_id,
    }));
  },
  [selectedPeriod, dateRange.start.toISOString(), dateRange.end.toISOString()]
);


  // Calculate expense summary by category
  interface ExpenseSummaryItem {
    category_id: number;
    total: number;
  }
  
  const expenseSummary = useMemo<ExpenseSummaryItem[]>(() => {
    if (!filteredExpenses.length) return [];
    
    const summaryMap = filteredExpenses.reduce<Record<number, number>>((acc, expense) => {
      const currentSum = acc[expense.category_id] || 0;
      acc[expense.category_id] = currentSum + expense.amount;
      return acc;
    }, {});
    
    return Object.entries(summaryMap).map(([categoryId, sum]) => ({
      category_id: Number(categoryId),
      total: Number(sum)
    }));
  }, [filteredExpenses]);

  const recentTransactions = useMemo(() => {
    if (!filteredExpenses.length) return [];
    
    return filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);
  }, [filteredExpenses]);

  const navItems: NavItem[] = [
    { id: 'home', icon: <HomeIcon fontSize="large" />, label: 'Home' },
    { id: 'transactions', icon: <ReceiptIcon fontSize="large" />, label: 'Transactions' },
    { id: 'add', icon: <AddIcon fontSize="large" />, label: 'Add' },
    { id: 'stats', icon: <PieChartIcon fontSize="large" />, label: 'Stats' },
    { id: 'settings', icon: <SettingsIcon fontSize="large" />, label: 'Settings' },
  ];

  const getTotalExpenses = (): number => {
    return expenseSummary.reduce((sum, item) => sum + item.total, 0);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isError) {
    emitError('Error loading expenses');
  }

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
                  <ReceiptIcon className="text-warning-600" />
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
                <div key={item.category_id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
                    <ReceiptIcon />
                  </div>
                  <div className="text-sm text-neutral-500">Category {item.category_id}</div>
                  <div className="font-semibold">${item.total.toFixed(2)}</div>
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
              {recentTransactions.map((transaction: Expense) => {
                const isIncome = transaction.amount > 0;
                return (
                  <div key={transaction.id} className="flex items-center bg-white rounded-xl p-3 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      isIncome ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
                    }`}>
                      {isIncome ? '↑' : '↓'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{transaction.description || 'Untitled'}</div>
                      <div className="text-xs text-neutral-500">Category {transaction.category_id} • {transaction.date}</div>
                    </div>
                    <div className={`font-semibold ${
                      isIncome ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                );
              })}
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
