import React, { useState } from 'react';
import { getCurrencySymbol } from '../utils/currency';

const Calendar = ({ expenses = [], selectedDate, onSelectDate, currencyCode = 'USD' }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to format Date object to YYYY-MM-DD using local time
  const formatDateKey = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Group expenses by YYYY-MM-DD
  const expenseMap = React.useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      if (!exp.date) return;
      const dateObj = new Date(exp.date);
      const key = formatDateKey(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      if (!map[key]) {
        map[key] = { total: 0, count: 0 };
      }
      map[key].total += Number(exp.amount) || 0;
      map[key].count += 1;
    });
    return map;
  }, [expenses]);

  // Calendar matrix calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    onSelectDate(todayKey);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Today key
  const todayObj = new Date();
  const todayKey = formatDateKey(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

  const currencySymbol = getCurrencySymbol(currencyCode);

  // Render calendar grid days
  const calendarCells = [];

  // Previous month padding cells
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push(
      <div key={`prev-${dayNum}`} className="calendar-day day-other-month">
        <span className="day-number">{dayNum}</span>
      </div>
    );
  }

  // Current month cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(year, month, day);
    const isSelected = dateKey === selectedDate;
    const isToday = dateKey === todayKey;
    const dayData = expenseMap[dateKey];

    calendarCells.push(
      <div
        key={`curr-${day}`}
        className={`calendar-day ${isSelected ? 'day-selected' : ''} ${isToday ? 'day-today' : ''} ${dayData ? 'has-expenses' : ''}`}
        onClick={() => onSelectDate(dateKey)}
      >
        <div className="day-header">
          <span className="day-number">{day}</span>
          {isToday && <span className="today-pill">Today</span>}
        </div>

        {dayData && (
          <div className="day-expense-badge" title={`${dayData.count} expense(s)`}>
            <span className="badge-amount">
              {currencySymbol}{dayData.total.toFixed(0)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-card card">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={handlePrevMonth} className="btn-icon" title="Previous Month">
            ‹
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={handleNextMonth} className="btn-icon" title="Next Month">
            ›
          </button>
        </div>

        <button onClick={handleToday} className="btn-today">
          Today
        </button>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {calendarCells}
      </div>
    </div>
  );
};

export default Calendar;
