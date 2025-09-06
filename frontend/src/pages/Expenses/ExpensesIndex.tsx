import { useState, useMemo } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { and, gte, lte} from '@tanstack/db'
import { startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import { formatForInput, resetHours } from '../../utils'


import Layout from '../Layout';
import { ExpenseItem } from '../Expenses/ExpenseItem';
import { expensesCollection, updateExpenseCollection } from '../../db';
import WrapperTile from '../../components/WrapperTile';

const ExpensesIndex = () => {
  // Get min and max dates from the collection
  const { data: allExpenses = [] } = useLiveQuery(
    (q) => q.from({ e: expensesCollection })
  );

  // Initialize dates based on data or current month
  const [dateRange, setDateRange] = useState(() => {
    if (allExpenses.length === 0) {
      return {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
      };
    }
    
    const dates = allExpenses.map(e => new Date(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      startDate: resetHours(minDate) < resetHours(startOfMonth(new Date())) ? minDate : startOfMonth(new Date()),
      endDate: resetHours(maxDate) > resetHours(endOfMonth(new Date())) ? maxDate : endOfMonth(new Date())
    };
  });
  
  // Initialize selected dates to match the initial date range
  const [selectedDates, setSelectedDates] = useState(() => ({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  }));

  const { data: filteredExpenses = [], isLoading, isError } = useLiveQuery(
    (q) => 
      q.from({ e: expensesCollection })
       .where(({ e }) => 
         and(
           gte(e.date, dateRange.startDate.toISOString()),
           lte(e.date, dateRange.endDate.toISOString())
         )
      )
      .orderBy(({ e }) => e.date, 'desc'),
    ['expenses', resetHours(dateRange.startDate), resetHours(dateRange.endDate)]
  );

  const totalExpenses = useMemo(
    () =>
      filteredExpenses
        .reduce((sum, expense) => sum + Math.abs(expense.amount), 0)
        .toFixed(2),
    [filteredExpenses, dateRange.startDate, dateRange.endDate]
  );

  const handleDateChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => {
    // Create date from input value (browser will handle timezone conversion)
    const date = new Date(e.target.value);

    setSelectedDates(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: date
    }));
  };
  
  const applyDateRange = async () => {
    // Create new date objects to avoid reference issues
    const newStartDate = new Date(selectedDates.startDate);
    const newEndDate = new Date(selectedDates.endDate);
    
    newStartDate.setUTCHours(0, 0, 0, 0);
    newEndDate.setUTCHours(23, 59, 59, 999);
    
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
    console.log('applied date....aa..')
    console.log(newStartDate);
    console.log(newEndDate)
    // Update the expense collection with the new date range
    await updateExpenseCollection(newStartDate, newEndDate);
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
            value={formatForInput(selectedDates.startDate)}
            onChange={(e) => handleDateChange('start', e)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="relative flex-1">
          <input
            type="date"
            value={formatForInput(selectedDates.endDate)}
            onChange={(e) => handleDateChange('end', e)}
            min={formatForInput(selectedDates.startDate)}
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
    </Layout>
  );
};

export default ExpensesIndex;
