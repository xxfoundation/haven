import { TypedEventEmitter } from 'src/types';
import { useEffect, useState } from 'react';
import delay from 'delay';

export const encoder = new TextEncoder();
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
};

export const exportDataToFile = (data: Uint8Array) => {
  const filename = 'HavenIdentity.json';

  const file = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const byEntryTimestamp = (x: [string, unknown], y: [string, unknown]) =>
  new Date(x[0]).getTime() - new Date(y[0]).getTime();

export const makeListenerHook =
  <T extends Record<string | number, any>>(bus: TypedEventEmitter<T>) =>
  <K extends keyof T>(key: K, listener: T[K]) => {
    useEffect(() => {
      bus.addListener(key, listener);

      return () => {
        bus.removeListener(key, listener);
      };
    }, [key, listener]);
  };

export const makeEventHook =
  <T extends Record<string | number, any>>(bus: TypedEventEmitter<T>) =>
  <K extends keyof T>(key: K) => {
    const [value, setValue] = useState<Parameters<T[K]>[0]>();

    useEffect(() => {
      const listener = (...args: Parameters<T[K]>) => {
        setValue(args[0]);
      };

      bus.addListener(key, listener as any);

      return () => {
        bus.removeListener(key, listener as any);
      };
    }, [key, value]);

    return value;
  };

type AnyFunc = (...args: any) => any;
export const makeEventAwaiter =
  <T extends Record<string | number, AnyFunc>>(bus: TypedEventEmitter<T>) =>
  <K extends keyof T>(
    evt: K,
    predicate: (...params: Parameters<T[K]>) => boolean = () => true,
    timeout = 10000
  ): Promise<Parameters<T[K]> | undefined> => {
    let listener: AnyFunc;
    let resolved = false;
    const promise = new Promise<Parameters<T[K]>>((resolve) => {
      listener = (...args: Parameters<T[K]>) => {
        const result = predicate(...args);
        if (result) {
          resolved = true;
          resolve(args as Parameters<T[K]>);
        }
      };
      bus.addListener(evt, listener as T[K]);
    });

    return Promise.race([
      promise,
      delay(timeout).then(() => {
        if (!resolved) {
          throw new Error(`Awaiting event ${String(evt)} timed out.`);
        }
        return undefined;
      })
    ]).finally(() => {
      bus.removeListener(evt, listener as any);
    });
  };

export const HTMLToPlaintext = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html').documentElement.textContent;
