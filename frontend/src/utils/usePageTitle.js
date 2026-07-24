import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} - Expense Tracker` : 'Expense Tracker';
  }, [title]);
};
