import { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte, eq } from '@tanstack/db';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import Layout from '../Layout';
import { ExpenseItem } from './ExpenseItem';
import { expensesCollection, categoriesCollection } from '../../db';
import type { ExpenseWithCategory } from '../../types/models';
import WrapperTile from '../../components/WrapperTile';

const ExpensesIndex = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    key: 'selection',
  });

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
            gte(expenses.date, dateRange.startDate.toISOString()),
            lte(expenses.date, dateRange.endDate.toISOString())
          )
        )
        .orderBy(({ expenses }) => [expenses.date, 'desc']);

      return query.select(({ expenses, categories }) => ({
        ...expenses,
        category: categories
      }));
    },
    [dateRange.startDate.toISOString(), dateRange.endDate.toISOString()]
  );

  const totalExpenses = useMemo(
    () =>
      filteredExpenses
        .filter((expense) => expense.amount < 0)
        .reduce((sum, expense) => sum + Math.abs(expense.amount), 0)
        .toFixed(2),
    [filteredExpenses]
  );

  const handleSelect = useCallback((ranges: any) => {
    try {
      setDateRange({
        startDate: new Date(ranges.selection.startDate),
        endDate: new Date(ranges.selection.endDate),
        key: 'selection',
      });
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error setting date range:', error);
      // Reset to current month on error
      setDateRange({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        key: 'selection',
      });
    }
  }, []);

  const formatDateRange = (start: Date, end: Date) => {
    if (isSameMonth(start, end)) {
      return format(start, 'MMM d') + ' - ' + format(end, 'd, yyyy');
    }
    return format(start, 'MMM d, yyyy') + ' - ' + format(end, 'MMM d, yyyy');
  };

  if (isError) {
    throw new Error('Failed to load expenses. Please try again later.');
  }

  const header = (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-neutral-900">Expenses</h1>
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="px-4 py-2 border rounded-lg text-sm font-medium"
        >
          {formatDateRange(dateRange.startDate, dateRange.endDate)}
        </button>
        {showDatePicker && (
          <div className="absolute right-0 z-10 mt-2">
            <DateRangePicker
              ranges={[dateRange]}
              onChange={handleSelect}
              months={2}
              direction="horizontal"
              showMonthAndYearPickers={true}
              rangeColors={['#3B82F6']}
              className="border rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout header={header}>
      <WrapperTile>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Total Expense</p>
              <p className="text-2xl font-bold">$ {totalExpenses}</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredExpenses.length} transactions
            </div>
          </div>
        </div>
      </WrapperTile>

      <WrapperTile>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense: ExpenseWithCategory) => (
              <ExpenseItem key={expense.id} {...expense} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No expenses found for the selected period
            </div>
          )}
        </div>
      </WrapperTile>
    </Layout>
  );
};

export default ExpensesIndex;
