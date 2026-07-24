import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CURRENCIES } from '../utils/currency';

const Navbar = () => {
  const { user, token, updateCurrency, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCurrencyChange = async (e) => {
    const newCurr = e.target.value;
    await updateCurrency(newCurr);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">💳</span> ExpenseTracker
        </Link>
        <div className="nav-links">
          {token ? (
            <>
              <Link to="/dashboard" className="nav-item">Calendar</Link>
              <Link to="/analytics" className="nav-item">Analytics</Link>
              <Link to="/insights" className="nav-item nav-insights">
                <span>✨ AI Insights</span>
              </Link>
              
              <div className="currency-selector-nav">
                <span className="currency-label">Currency:</span>
                <select
                  value={user?.currency || 'USD'}
                  onChange={handleCurrencyChange}
                  className="currency-select"
                  title="Change Preferred Currency"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <span className="user-welcome">Hi, {user?.name || 'User'}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="btn-primary-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
