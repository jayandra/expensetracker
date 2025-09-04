import { useState, useMemo } from 'react';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte, eq } from '@tanstack/db'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { ExpenseItem } from './Expenses/ExpenseItem';
import { emitError } from '../services/errorBus';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import TableChartIcon from '@mui/icons-material/TableChart';
import { expensesCollection, categoriesCollection } from '../db';
import type { ExpenseWithCategory } from '../types/models';
import WrapperTile from '../components/WrapperTile';

const Dashboard = () => {
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

  const header = (
    <div className="flex justify-between items-center">
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
  );

  return (
    <Layout header={header}>
      <div className="w-full">
        <WrapperTile>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
        </WrapperTile>
        
        <WrapperTile>
          {/* Expense Categories */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-neutral-900">Top Expense Categories</h2>
                <button className="text-xs text-primary-600">See All</button>
              </div>
              <div className="space-y-4">
                {expenseSummary.slice(0,5).map((item, index) => {
                  // Calculate percentage of total expenses
                  const percentage = (item.total / getTotalExpenses()) * 100;
                  // Using primary color for all progress bars
                  const colors = ['bg-primary-500'];
                  
                  return (
                    <div key={item.category_name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-700">{item.category_name}</span>
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-neutral-500 text-right">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </WrapperTile>
        
        <WrapperTile>
          {/* Recent Transactions */}
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
        </WrapperTile>    
      </div>
    </Layout>
  );
};

export default Dashboard;
