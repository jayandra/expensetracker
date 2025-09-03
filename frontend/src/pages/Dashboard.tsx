import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte, eq } from '@tanstack/db'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { ExpenseItem } from './Expenses/ExpenseItem';
import { emitError } from '../services/errorBus';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddIcon from '@mui/icons-material/Add';
import PieChartIcon from '@mui/icons-material/PieChart';
import SettingsIcon from '@mui/icons-material/Settings';
import type { ReactNode } from 'react';
import { expensesCollection, categoriesCollection } from '../db';
import type { ExpenseWithCategory } from '../types/models';

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
        .join(
          { categories: categoriesCollection },
          ({ expenses, categories }) => eq(expenses.category_id, categories.id),
          'inner'
        )
        .where(({ expenses }) =>
          and(
            gte(expenses.date, dateRange.start.toISOString()),
            lte(expenses.date, dateRange.end.toISOString())
          )
        );

      return query.select(({ expenses, categories }) => ({
        ...expenses,
        category: categories
      }));
    },
    [selectedPeriod, dateRange.start.toISOString(), dateRange.end.toISOString()]
  );


  // Calculate expense summary by category
  interface ExpenseSummaryItem {
    category_name: string;
    total: number;
  }
  
  const expenseSummary = useMemo<ExpenseSummaryItem[]>(() => {
    if (!filteredExpenses.length) return [];
    
    const summaryMap = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
      const currentSum = acc[expense.category.name] || 0;
      acc[expense.category.name] = currentSum + expense.amount;
      return acc;
    }, {});
    
    return Object.entries(summaryMap)
      .map(([category, sum]) => ({
        category_name: category,
        total: Number(sum)
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const recentTransactions: ExpenseWithCategory[] = useMemo(() => {
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

  const getLargestExpense = (): number => {
    if (!filteredExpenses.length) return 0;
    return Math.max(...filteredExpenses.map(expense => expense.amount));
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
            {/* Total Balance */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold">$ {(getTotalExpenses()).toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <TableChartIcon className="text-primary-600" />
                </div>
              </div>
            </div>

            {/* Biggest Expense */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-sm">Biggest Expense</p>
                  <p className="text-2xl font-bold">$ {getLargestExpense().toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                  <ReceiptIcon className="text-warning-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-neutral-900">Top Expense Categories</h2>
              <button className="text-xs text-primary-600">See All</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {expenseSummary.slice(0, 4).map((item) => (
                <div key={item.category_name} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex-shrink-0 flex items-center justify-center">
                      <ReceiptIcon />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-neutral-500 truncate">{item.category_name}</div>
                      <div className="font-semibold">${item.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Expenses</h2>
              <Link to="/expenses" className="text-xs text-primary-600 hover:text-primary-700">
                See All
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((expense: ExpenseWithCategory) => (
                <ExpenseItem key={expense.id} {...expense} />
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
