import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import DayPanel from '../components/DayPanel';
import { formatAmount } from '../utils/currency';
import { usePageTitle } from '../utils/usePageTitle';

const Dashboard = () => {
  usePageTitle('Calendar Dashboard');
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default to today's date formatted as YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (expenseData) => {
    // Post to API with date locked to selectedDate
    await API.post('/expenses', expenseData);
    await fetchExpenses();
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    await API.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((exp) => exp._id !== id));
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const currencyCode = user?.currency || 'USD';

  return (
    <div className="dashboard-calendar-page">
      <header className="dashboard-header">
        <div>
          <h1>Calendar Dashboard</h1>
          <p>Select any date on the calendar to view, log, or manage daily expenses</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Spent ({currencyCode})</span>
          <span className="summary-value">{formatAmount(totalAmount, currencyCode)}</span>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading calendar & expense data...</span>
        </div>
      ) : (
        <div className="calendar-dashboard-grid">
          {/* Monthly Calendar View */}
          <div className="calendar-column">
            <Calendar
              expenses={expenses}
              selectedDate={selectedDate}
              onSelectDate={(dateStr) => setSelectedDate(dateStr)}
              currencyCode={currencyCode}
            />
          </div>

          {/* Inline Selected Date Expense Panel */}
          <div className="day-panel-column">
            <DayPanel
              selectedDate={selectedDate}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              currencyCode={currencyCode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
