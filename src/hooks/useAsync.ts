/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

const useAsync = <T extends ((...args: any[]) => Promise<any>)>(
  asyncFunction: T
) => {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [value, setValue] = useState<Awaited<ReturnType<T>>>();
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback((...args: Parameters<T>) => {
    setStatus('pending');
    setValue(undefined);
    setError(null);

    return asyncFunction(...args)
      .then((response: Awaited<ReturnType<T>>) => {
        setValue(response);
        setStatus('success');
        return response;
      })
      .catch((err) => {
        setError((err as Error).message || err);
        setStatus('error');
      });
  }, [asyncFunction]);

  return { execute, status, value, error };
};

export default useAsync;
