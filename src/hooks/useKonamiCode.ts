import { useEffect, useState, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

function useKonami(action: () => void, { code = KONAMI_CODE } = {}) {
  const [input, setInput] = useState<string[]>([]);

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const newInput = input;
      newInput.push(e.key);
      newInput.splice(-code.length - 1, input.length - code.length);

      setInput(newInput);

      if (newInput.join('').includes(code.join(''))) {
        action();
      }
    },
    [input, setInput, code, action],
  );

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyUp]);
}

export default useKonami;