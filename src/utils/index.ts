/* eslint-disable @typescript-eslint/no-explicit-any */
import { deflateSync, inflateSync } from 'zlib';
import DOMPurify from 'dompurify';
import { TypedEventEmitter } from '@types';
import { useEffect, useState } from 'react';
import delay from 'delay';

// Encodes Uint8Array to a string.
export const encoder = new TextEncoder();

// Decodes a string to a Uint8Array.
export const decoder = new TextDecoder();

export const isClientSide = () => {
  return typeof window !== 'undefined';
};

export const envIsDev = () => {
  let isDev = false;
  if (isClientSide()) {
    isDev = window.location.href.indexOf('localhost') !== -1;
    isDev ||= window.location.href.indexOf('dev') !== -1;
  }
  return isDev;
}

export const exportDataToFile = (data: Uint8Array) => {
  const filename = 'speakeasyIdentity.json';

  const file = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const byEntryTimestamp = (x: [string, unknown], y: [string, unknown]) => new Date(x[0]).getTime() - new Date(y[0]).getTime()

const sanitize = (markup: string) => DOMPurify.sanitize(markup, {
  ALLOWED_TAGS: ['blockquote', 'p', 'a', 'br', 'code', 'ol', 'ul', 'li', 'pre', 'i', 'strong', 'b', 'em', 'span', 's'],
  ALLOWED_ATTR: ['target', 'href', 'rel', 'class', 'style']
});

export const inflate = (content: string) => {
  let inflated: string;
  try {
    inflated = inflateSync(Buffer.from(content, 'base64')).toString();
  } catch (e) {
    console.error('Couldn\'t decode message. Falling back to plaintext.', e);
    inflated = content;
  }

  return sanitize(inflated);
}

export const deflate = (content: string) => deflateSync(content).toString('base64');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeListenerHook = <T extends Record<string|number, any>>(bus: TypedEventEmitter<T>) => <K extends keyof T>(key: K, listener: T[K]) => {
  useEffect(() => {
    bus.addListener(key, listener);

    return () => {
      bus.removeListener(key, listener);
    }
  }, [key, listener]);
}

export const makeEventHook = <T extends Record<string|number, any>>(bus: TypedEventEmitter<T>) => <K extends keyof T>(key: K) => {
  const [value, setValue] = useState<Parameters<T[K]>[0]>();

  useEffect(() => {
    const listener = (...args: Parameters<T[K]>) => {
      setValue(args[0]);
    }

    bus.addListener(key, listener as any);

    return () => {
      bus.removeListener(key, listener as any);
    }
  }, [key, value]);

  return value;
}

type AnyFunc = (...args: any) => any;
export const makeEventAwaiter = <T extends Record<string|number, AnyFunc>>(bus: TypedEventEmitter<T>) =>
  <K extends keyof T>(
    evt: K,
    predicate: (...params: Parameters<T[K]>) => boolean = () => true,
    timeout = 10000
  ): Promise<Parameters<T[K]> | undefined> => {
    let listener: AnyFunc;
    let resolved = false;
    const promise = new Promise<Parameters<T[K]>>((resolve) => {
      listener = (...args) => {
        const result = predicate(...args);
        if (result) {
          resolved = true;
          resolve(args);
        }
      };
      bus.addListener(evt, listener as any);
    });
  
    return Promise.race([
      promise,
      delay(timeout).then(() => {
        if (!resolved) {
          throw new Error(`Awaiting event ${String(evt)} timed out.`)
        }
        return undefined;
      })
    ]).finally(() => {
      bus.removeListener(evt, listener as any);
    });
  }
