import { useUI } from '@contexts/ui-context';
import { envIsDev } from '@utils/index';
import { useEffect, useState, useCallback } from 'react';

const DEV_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
];

function useIsDev() {
  const [input, setInput] = useState<string[]>([]);
  const [inputted, setInputted] = useState<boolean>(envIsDev());
  const { alert } = useUI();

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const newInput = input;
      newInput.push(e.key);
      newInput.splice(-DEV_CODE.length - 1, input.length - DEV_CODE.length);

      setInput(newInput);

      if (!inputted && newInput.join('').includes(DEV_CODE.join(''))) {
        alert({ type: 'success', content: 'Dev mode enabled' });
        setInputted(true);
      }
    },
    [alert, input, inputted],
  );

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyUp]);

  return inputted;
}

export default useIsDev;