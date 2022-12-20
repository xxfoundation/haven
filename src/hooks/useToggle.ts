import { useCallback, useEffect, useMemo, useState } from 'react';

type UseToggle = [
  boolean,
  {
    set: (active: boolean) => void;
    toggle: () => void;
    toggleOn: () => void;
    toggleOff: () => void;
  }
];

const useToggle = (defaultValue = false, onToggle?: (isActive: boolean) => void): UseToggle => {
  const [isActive, setActive] = useState(defaultValue);

  const toggle = useCallback((): void => {
    setActive((active) => !active);
  }, []);

  const set = useCallback(
    (active: boolean): void => {
      setActive(active);
    },
    []
  );

  const toggleOn = useCallback(() => set(true), [set]);

  const toggleOff = useCallback(() => set(false), [set]);

  useEffect(() => onToggle && onToggle(isActive), [isActive, onToggle]);

  return useMemo(
    () => [
      isActive,
      {
        set,
        toggle,
        toggleOn,
        toggleOff
      }
    ],
    [isActive, set, toggle, toggleOn, toggleOff]
  );
}

export default useToggle;
