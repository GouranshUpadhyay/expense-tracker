import React, { useState } from 'react';
import { formatAmount, getCurrencySymbol } from '../utils/currency';

const DayPanel = ({ selectedDate, expenses = [], onAddExpense, onDeleteExpense, currencyCode = 'USD' }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Format date display (e.g. "Thursday, July 24, 2026")
  const dateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const formattedDisplayDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Filter expenses strictly matching selectedDate (YYYY-MM-DD)
  const dayExpenses = expenses.filter((exp) => {
    if (!exp.date) return false;
    const expDateObj = new Date(exp.date);
    const expKey = `${expDateObj.getFullYear()}-${String(expDateObj.getMonth() + 1).padStart(2, '0')}-${String(expDateObj.getDate()).padStart(2, '0')}`;
    return expKey === selectedDate;
  });

  const dayTotal = dayExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !category) {
      setError('Amount and category are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddExpense({
        amount: Number(amount),
        category,
        description,
        date: selectedDate // Lock expense strictly to selected calendar date!
      });
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="day-panel-card card">
      <div className="day-panel-header">
        <div>
          <h3>{formattedDisplayDate}</h3>
          <span className="day-panel-sub">Manage & log expenses for this date</span>
        </div>
        <div className="day-running-total">
          <span className="total-label">Day Total</span>
          <span className="total-amount">{formatAmount(dayTotal, currencyCode)}</span>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Inline Add Expense Form */}
      <form onSubmit={handleSubmit} className="day-add-form">
        <h4>+ Add Expense for {selectedDate}</h4>
        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="day-amount">Amount ({currencySymbol})</label>
            <input
              id="day-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group flex-1">
            <label htmlFor="day-category">Category</label>
            <select
              id="day-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Food">🍔 Food & Dining</option>
              <option value="Transportation">🚗 Transportation</option>
              <option value="Utilities">💡 Utilities & Bills</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Health">💊 Health & Fitness</option>
              <option value="Other">📦 Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="day-desc">Description (Optional)</label>
          <input
            id="day-desc"
            type="text"
            placeholder="Item details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary mt-2" disabled={submitting}>
          {submitting ? 'Saving...' : `Add Expense to ${selectedDate}`}
        </button>
      </form>

      {/* Day's Expense List */}
      <div className="day-expense-list-section">
        <h4>Log for this date ({dayExpenses.length})</h4>

        {dayExpenses.length === 0 ? (
          <div className="day-empty-state">
            <p>No expenses logged for this date.</p>
          </div>
        ) : (
          <div className="day-items-list">
            {dayExpenses.map((exp) => (
              <div key={exp._id} className="day-item-card">
                <div className="day-item-main">
                  <span className={`badge badge-${exp.category?.toLowerCase() || 'other'}`}>
                    {exp.category}
                  </span>
                  <span className="day-item-desc">{exp.description || 'No description'}</span>
                </div>
                <div className="day-item-right">
                  <span className="day-item-amount">{formatAmount(exp.amount, currencyCode)}</span>
                  <button
                    onClick={() => onDeleteExpense(exp._id)}
                    className="btn-delete-sm"
                    title="Delete expense"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayPanel;
