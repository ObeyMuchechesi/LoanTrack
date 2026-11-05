import { useCallback, useEffect, useState } from 'react';

// Centralised loading/error state. Without a .catch() an API failure leaves a
// page stuck on its loading placeholder and produces an unhandled rejection.
export function useLoad(loader, deps = [], initial = null) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return Promise.resolve()
      .then(loader)
      .then((value) => setData(value))
      .catch((e) => {
        setError(e.response?.data?.message || 'Could not load data. Please try again.');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { reload(); }, [reload]);

  return { data, error, loading, reload };
}

export const errorMessage = (e) =>
  e.response?.data?.message || e.message || 'Something went wrong. Please try again.';
