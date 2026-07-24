import React, { useState } from 'react';
import API from '../api/axios';
import { usePageTitle } from '../utils/usePageTitle';

const parseInsightText = (rawText) => {
  if (!rawText) return null;

  const sections = {
    summary: '',
    patterns: '',
    recommendations: '',
    raw: rawText
  };

  // Try splitting by Markdown headers ### Summary, ### Patterns, ### Recommendations
  const summaryMatch = rawText.match(/###\s*Summary([\s\S]*?)(?=###|$)/i) || rawText.match(/1\.\s*Summary([\s\S]*?)(?=2\.|###|$)/i);
  const patternsMatch = rawText.match(/###\s*Patterns([\s\S]*?)(?=###|$)/i) || rawText.match(/2\.\s*Patterns([\s\S]*?)(?=3\.|###|$)/i);
  const recommendationsMatch = rawText.match(/###\s*Recommendations([\s\S]*?)(?=###|$)/i) || rawText.match(/3\.\s*Recommendations([\s\S]*?)(?=###|$)/i);

  if (summaryMatch) sections.summary = summaryMatch[1].trim();
  if (patternsMatch) sections.patterns = patternsMatch[1].trim();
  if (recommendationsMatch) sections.recommendations = recommendationsMatch[1].trim();

  // If structured sections weren't matched via regex, fall back to simple splitting
  const isStructured = sections.summary || sections.patterns || sections.recommendations;

  return { sections, isStructured };
};

const Insights = () => {
  usePageTitle('AI Insights');
  const [insightRaw, setInsightRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    setInsightRaw('');
    try {
      const res = await API.get('/insights');
      setInsightRaw(res.data.insight);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to fetch AI spending insights. Please check server configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  const parsedData = parseInsightText(insightRaw);

  return (
    <div className="insights-container">
      {/* Header Hero Banner */}
      <div className="insights-header-card">
        <div className="insights-title-area">
          <div className="insights-badge">Powered by Gemini 3.6 Flash</div>
          <h1>AI Spending Insights</h1>
          <p>
            Get instant, personalized financial analysis, spending patterns, and tailored savings recommendations calculated from your expense history.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="btn-ai-generate"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Analyzing Expenses...
            </>
          ) : (
            <>✨ Generate AI Spending Insights</>
          )}
        </button>
      </div>

      {error && <div className="alert-error mt-4">{error}</div>}

      {/* Skeleton Loading State */}
      {loading && (
        <div className="insights-skeleton-grid">
          <div className="card skeleton-card">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line skeleton-short"></div>
          </div>
          <div className="card skeleton-card">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line skeleton-short"></div>
          </div>
          <div className="card skeleton-card">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line skeleton-short"></div>
          </div>
        </div>
      )}

      {/* Insight Display Cards */}
      {insightRaw && !loading && parsedData && (
        <div className="insights-results-grid">
          {parsedData.isStructured ? (
            <>
              {parsedData.sections.summary && (
                <div className="card insight-card summary-card-ui">
                  <div className="insight-card-header">
                    <span className="card-icon">📊</span>
                    <div>
                      <h3>Spending Summary</h3>
                      <span className="card-subtitle">Overview of your recent financial activity</span>
                    </div>
                  </div>
                  <div className="insight-card-body">
                    <p>{parsedData.sections.summary}</p>
                  </div>
                </div>
              )}

              {parsedData.sections.patterns && (
                <div className="card insight-card patterns-card-ui">
                  <div className="insight-card-header">
                    <span className="card-icon">🔍</span>
                    <div>
                      <h3>Spending Patterns & Trends</h3>
                      <span className="card-subtitle">Observed category habits & behavior</span>
                    </div>
                  </div>
                  <div className="insight-card-body">
                    <p>{parsedData.sections.patterns}</p>
                  </div>
                </div>
              )}

              {parsedData.sections.recommendations && (
                <div className="card insight-card recommendations-card-ui">
                  <div className="insight-card-header">
                    <span className="card-icon">💡</span>
                    <div>
                      <h3>Personalized Savings Recommendations</h3>
                      <span className="card-subtitle">Actionable tips to optimize your budget</span>
                    </div>
                  </div>
                  <div className="insight-card-body">
                    <p>{parsedData.sections.recommendations}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card insight-card fallback-card-ui">
              <div className="insight-card-header">
                <span className="card-icon">🤖</span>
                <div>
                  <h3>AI Insights Report</h3>
                  <span className="card-subtitle">Personalized analysis of your expenses</span>
                </div>
              </div>
              <div className="insight-card-body">
                {insightRaw.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State / Illustration */}
      {!insightRaw && !loading && !error && (
        <div className="insights-placeholder card">
          <div className="placeholder-illustration">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ai-icon-svg"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h3>Unlock AI Financial Insights</h3>
          <p>Click the button above to generate smart analysis, spending trends, and customized savings tips.</p>
        </div>
      )}
    </div>
  );
};

export default Insights;
