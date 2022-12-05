import { useCallback, useEffect, useMemo, useState } from 'react';

import useIsMountedRef from './useIsMountedRef';

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
  const mountedRef = useIsMountedRef();
  const [isActive, setActive] = useState(defaultValue);

  const toggle = useCallback((): void => {
    if (mountedRef.current) {
      setActive((active) => !active);
    }
  }, [mountedRef]);

  const set = useCallback(
    (active: boolean): void => {
      if (mountedRef.current) {
        setActive(active);
      }
    },
    [mountedRef]
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
