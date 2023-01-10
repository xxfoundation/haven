import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';

type CopyResponse = [
  boolean,
  (copy: string) => void,
  string
];

export default function useCopyClipboard(timeout = 1000): CopyResponse {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const staticCopy = useCallback(
    (text: string) => {
      const didCopy = copy(text);
      setCopiedText(text);
      setIsCopied(didCopy);
    },
    []
  );

  useEffect(() => {
    if (isCopied) {
      const hide = setTimeout(() => {
        setIsCopied(false);
      }, timeout);

      return () => {
        clearTimeout(hide);
      };
    }
    return undefined;
  }, [isCopied, setIsCopied, timeout]);

  return [isCopied, staticCopy, copiedText];
}
