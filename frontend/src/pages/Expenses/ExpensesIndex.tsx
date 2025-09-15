import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte } from '@tanstack/db';

import Layout from '../Layout';
import { ExpenseItem } from '../Expenses/ExpenseItem';
import { expensesCollection, updateExpenseCollection } from '../../db';
import WrapperTile from '../../components/WrapperTile';
import { formatDate, getCurrentMonthRange } from '../../utils'
import {useAuth} from '../../contexts/AuthContext';

const ExpensesIndex = () => {
  const { user } = useAuth();
  // Get min and max dates from the collection
  const { data: allExpenses = [] } = useLiveQuery(
    (q) => q.from({ e: expensesCollection })
  );

  // Initialize date range for internal computation (stored as 'YYYY-MM-DD' strings)
  const [dateRange, setDateRange] = useState(() => {
    if (user?.demo_user) {
      return({
        startDate: '2025-07-01',
        endDate: '2025-07-31'
      });
    }

    const { firstDay, lastDay } = getCurrentMonthRange();
    const defaultStart = formatDate(firstDay);
    const defaultEnd = formatDate(lastDay);
    
    if (allExpenses.length === 0) {
      return {
        startDate: defaultStart,
        endDate: defaultEnd
      };
    }
    
    // Find min and max dates from expenses and ensure they're in YYYY-MM-DD format
    const dates = allExpenses.map(e => e.date.split('T')[0]);
    const minDate = dates.reduce((min, date) => date < min ? date : min, dates[0]);
    const maxDate = dates.reduce((max, date) => date > max ? date : max, dates[0]);
    
    return {
      startDate: minDate < defaultStart ? minDate : defaultStart,
      endDate: maxDate > defaultEnd ? maxDate : defaultEnd
    };
  });
  
  // Initialize selected dates for display (stored as 'YYYY-MM-DD' strings)
  const [selectedDates, setSelectedDates] = useState({ start_date: '', end_date: '' });

  // Initialize and update selected dates when dateRange changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      setSelectedDates({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      });
    }
  }, [dateRange]);

  const { data: filteredExpenses = [], isLoading, isError } = useLiveQuery(
    (q) => 
      q.from({ e: expensesCollection })
       .where(({ e }) => 
         and(
           gte(e.date as unknown as string, dateRange.startDate),
           lte(e.date as unknown as string, dateRange.endDate)
         )
      )
      .orderBy(({ e }) => e.date, 'desc'),
    ['expenses', dateRange.startDate, dateRange.endDate]
  );

  const totalExpenses = useMemo(
    () =>
      filteredExpenses
        .reduce((sum, expense) => sum + Math.abs(expense.amount), 0)
        .toFixed(2),
    [filteredExpenses]
  );

  const handleDateChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setSelectedDates(prev => ({
      ...prev,
      [type === 'start' ? 'start_date' : 'end_date']: dateValue
    }));
  };
  
  const applyDateRange = async () => {
    // Ensure start date is before or equal to end date
    let startDate = selectedDates.start_date;
    let endDate = selectedDates.end_date;

    if (user?.demo_user) {
      if (startDate < '2025-07-01') {
        startDate = '2025-07-01';
      }
      if (endDate > '2025-07-31') {
        endDate = '2025-07-31';
      }
    }
    
    if (startDate > endDate) {
      // Swap dates if they're in the wrong order
      setDateRange({
        startDate: endDate,
        endDate: startDate
      });
    } else {
      setDateRange({
        startDate,
        endDate
      });
    }

    // Only update if the new range is outside the current bounds
    if (startDate < dateRange.startDate || endDate > dateRange.endDate) {
      await updateExpenseCollection(startDate, endDate);
    }
  };
  

  if (isError) {
    throw new Error('Failed to load expenses. Please try again later.');
  }

  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">Expenses</h1>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div className="relative flex-1">
          <input
            type="date"
            value={selectedDates.start_date}
            onChange={(e) => handleDateChange('start', e)}
            max={selectedDates.end_date}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="relative flex-1">
          <input
            type="date"
            value={selectedDates.end_date}
            onChange={(e) => handleDateChange('end', e)}
            min={selectedDates.start_date}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button
          onClick={applyDateRange}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Go
        </button>
      </div>
    </div>
  );

  return (
    <Layout header={header}>
      <div className="w-full">
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
            filteredExpenses.map((expense) => (
              <ExpenseItem key={expense.id} {...expense} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No expenses found for the selected period
            </div>
          )}
        </div>
      </WrapperTile>
      </div>
    </Layout>
  );
};

export default ExpensesIndex;
