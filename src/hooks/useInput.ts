import { useState, useCallback, ChangeEvent } from 'react';

type OnChangeType = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
type UseInput = (initialValue?: string) => [string, OnChangeType, { set: (value: string) => void, touched: boolean }];

const useInput: UseInput = (initValue = '') => {
  const [value, set] = useState(initValue);
  const [touched, setTouched] = useState(false);

  const handler = useCallback<OnChangeType>((e) => {
    setTouched(true);
    set(e.target.value);
  }, []);

  return [value, handler, { set, touched }];
}; 

export default useInput;
