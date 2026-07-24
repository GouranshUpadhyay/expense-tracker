export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'USD ($)' },
  { code: 'INR', symbol: '₹', name: 'INR (₹)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)' }
];

export const getCurrencySymbol = (code = 'USD') => {
  const found = CURRENCIES.find((c) => c.code === code);
  return found ? found.symbol : '$';
};

export const formatAmount = (amount, currencyCode = 'USD') => {
  const symbol = getCurrencySymbol(currencyCode);
  const val = Number(amount) || 0;
  return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
