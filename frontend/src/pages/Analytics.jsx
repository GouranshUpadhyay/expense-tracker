import React, { useState, useEffect, useContext } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { formatAmount, getCurrencySymbol } from '../utils/currency';
import { usePageTitle } from '../utils/usePageTitle';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transportation: '#0284c7',
  Utilities: '#6366f1',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Other: '#64748b'
};

const Analytics = () => {
  usePageTitle('Analytics');
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('daily'); // 'daily', 'weekly', 'monthly'

  const currencyCode = user?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await API.get('/expenses');
        setExpenses(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Filter expenses by timeframe
  const filteredExpenses = React.useMemo(() => {
    const now = new Date();
    return expenses.filter((exp) => {
      if (!exp.date) return false;
      const expDate = new Date(exp.date);
      const diffTime = now.getTime() - expDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      if (timeframe === 'daily') {
        return diffDays <= 7;
      } else if (timeframe === 'weekly') {
        return diffDays <= 30;
      } else if (timeframe === 'monthly') {
        return diffDays <= 365;
      }
      return true;
    });
  }, [expenses, timeframe]);

  // Aggregate stats: Total Spent, Top Category, Transaction Count
  const stats = React.useMemo(() => {
    const totalSpent = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const count = filteredExpenses.length;

    const categoryTotals = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });

    let topCategory = 'N/A';
    let topCategoryAmount = 0;

    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    return { totalSpent, count, topCategory, topCategoryAmount, categoryTotals };
  }, [filteredExpenses]);

  // Recharts Data 1: Category Pie Data
  const pieData = React.useMemo(() => {
    return Object.entries(stats.categoryTotals).map(([name, value]) => ({
      name,
      value
    }));
  }, [stats.categoryTotals]);

  // Recharts Data 2: Time Trend Data
  const trendData = React.useMemo(() => {
    const map = {};

    if (timeframe === 'daily') {
      // Group by last 7 days (YYYY-MM-DD)
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
        const key = d.toISOString().split('T')[0];
        map[key] = { label, amount: 0 };
      }

      filteredExpenses.forEach((e) => {
        const dateKey = new Date(e.date).toISOString().split('T')[0];
        if (map[dateKey]) {
          map[dateKey].amount += Number(e.amount) || 0;
        }
      });
    } else if (timeframe === 'weekly') {
      // Group by last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const label = `Week ${4 - i}`;
        map[i] = { label, amount: 0 };
      }
      filteredExpenses.forEach((e) => {
        const now = new Date();
        const expDate = new Date(e.date);
        const diffDays = (now - expDate) / (1000 * 3600 * 24);
        const weekIndex = 3 - Math.floor(diffDays / 7);
        if (weekIndex >= 0 && weekIndex < 4 && map[weekIndex]) {
          map[weekIndex].amount += Number(e.amount) || 0;
        }
      });
    } else {
      // Group by last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        map[key] = { label, amount: 0 };
      }

      filteredExpenses.forEach((e) => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (map[key]) {
          map[key].amount += Number(e.amount) || 0;
        }
      });
    }

    return Object.values(map);
  }, [filteredExpenses, timeframe]);

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div>
          <h1>Expense Analytics</h1>
          <p>Visual breakdown of your financial trends and category distributions</p>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="timeframe-tabs">
          <button
            className={`tab-btn ${timeframe === 'daily' ? 'active' : ''}`}
            onClick={() => setTimeframe('daily')}
          >
            Last 7 Days
          </button>
          <button
            className={`tab-btn ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Last 30 Days
          </button>
          <button
            className={`tab-btn ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            Last 12 Months
          </button>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading analytics charts...</span>
        </div>
      ) : (
        <>
          {/* Metrics Overview Cards */}
          <div className="analytics-metrics-grid">
            <div className="card metric-card">
              <span className="metric-icon">💰</span>
              <div>
                <span className="metric-label">Total Spent</span>
                <h3 className="metric-value">{formatAmount(stats.totalSpent, currencyCode)}</h3>
              </div>
            </div>

            <div className="card metric-card">
              <span className="metric-icon">🏆</span>
              <div>
                <span className="metric-label">Top Category</span>
                <h3 className="metric-value">{stats.topCategory}</h3>
                <span className="metric-sub">{formatAmount(stats.topCategoryAmount, currencyCode)}</span>
              </div>
            </div>

            <div className="card metric-card">
              <span className="metric-icon">📊</span>
              <div>
                <span className="metric-label">Total Transactions</span>
                <h3 className="metric-value">{stats.count}</h3>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Category Donut Chart */}
            <div className="card chart-card">
              <h3>Spending by Category</h3>
              {pieData.length === 0 ? (
                <div className="empty-chart">No data for selected period</div>
              ) : (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[entry.name] || '#64748b'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Spending Trend Bar Chart */}
            <div className="card chart-card">
              <h3>Spending Trend</h3>
              {trendData.length === 0 ? (
                <div className="empty-chart">No trend data for selected period</div>
              ) : (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(v) => `${currencySymbol}${v}`}
                      />
                      <Tooltip
                        formatter={(value) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Spent']}
                      />
                      <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
