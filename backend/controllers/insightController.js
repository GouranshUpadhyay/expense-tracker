const Expense = require('../models/Expense');
const User = require('../models/User');

const currencySymbols = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};

// @desc    Get AI spending insights based on user expenses
// @route   GET /api/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    // Fetch user details for currency preference
    const user = await User.findById(userId);
    const currencyCode = user?.currency || 'USD';
    const currencySymbol = currencySymbols[currencyCode] || '$';

    // Fetch user's expenses from MongoDB, limited to last 100, sorted by date descending
    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(100);

    // If user has no expenses, return friendly message instead of calling AI
    if (!expenses || expenses.length === 0) {
      return res.json({
        insight: 'No expenses found yet. Add some expenses to get personalized AI-powered spending insights!'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set in environment variables' });
    }

    // Build text prompt summarizing expenses with user's currency
    const expenseListStr = expenses
      .map((exp) => {
        const formattedDate = exp.date ? new Date(exp.date).toISOString().split('T')[0] : 'N/A';
        const description = exp.description ? ` (${exp.description})` : '';
        return `- Date: ${formattedDate}, Category: ${exp.category}, Amount: ${currencySymbol}${exp.amount}${description}`;
      })
      .join('\n');

    const prompt = `You are a financial advisor assistant analyzing expenses in ${currencyCode} (${currencySymbol}). Analyze the following user expenses (up to last 100 items sorted newest first):\n\n${expenseListStr}\n\nPlease format your response with the following exact markdown section headers:\n### Summary\n[Provide a concise overall spending summary]\n\n### Patterns\n[Highlight key spending patterns or category trends noticed]\n\n### Recommendations\n[Provide 2-3 actionable, personalized savings recommendations]`;

    // Send prompt to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.error?.message || 'Error fetching insights from Gemini API'
      });
    }

    const insightText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated.';

    res.json({ insight: insightText });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInsights
};
