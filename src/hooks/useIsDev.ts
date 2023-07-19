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

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const newInput = input;
      newInput.push(e.key);
      newInput.splice(-DEV_CODE.length - 1, input.length - DEV_CODE.length);

      setInput(newInput);

      if (newInput.join('').includes(DEV_CODE.join(''))) {
        setInputted(true);
      }
    },
    [input, setInput],
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