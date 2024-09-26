import React, { useCallback, useEffect } from 'react';

const useLocalStorage = <T = unknown>(keyName: string, defaultValue?: T): [value: T | null, setValue: (v: T) => void] => {
  const [storedValue, setStoredValue] = React.useState<T | null>(() => {
    try {
      const value = window.localStorage.getItem(keyName);

      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        window.dispatchEvent(new Event('storage'));
        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  });

  const onStorage = useCallback(() => {
    const value = window.localStorage.getItem(keyName);
    
    if (value !== null) {
      try {
        const parsed = JSON.parse(value);
        setStoredValue(parsed as T);
      } catch (e) {
        // probably a string
        setStoredValue(value as unknown as T);
      }
    }
  }, [keyName]);

  useEffect(() => {
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, [onStorage])

  const setValue = useCallback((newValue: T) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
      window.dispatchEvent(new Event('storage'));
    } catch (err) { }
    setStoredValue(newValue);
  }, [keyName]);

  return [storedValue, setValue];
};

export default useLocalStorage;