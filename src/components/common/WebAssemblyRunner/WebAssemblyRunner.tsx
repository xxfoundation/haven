/* eslint-disable @typescript-eslint/no-explicit-any */

import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';

import { InitXXDK, setXXDKBasePath } from 'xxdk-wasm';

import { useUtils } from 'src/contexts/utils-context';
import { useRouter } from 'next/router';

type Logger = {
  StopLogging: () => void;
  GetFile: () => Promise<string>;
  Threshold: () => number;
  MaxSize: () => number;
  Size: () => Promise<number>;
  Worker: () => Worker;
};

declare global {
  interface Window {
    onWasmInitialized: () => void;
    Crash: () => void;
    GetLogger: () => Logger;
    logger?: Logger;
    getCrashedLogFile: () => Promise<string>;
  }
}

function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function sendMessage<T>(action: string, key?: string, value?: any): Promise<T> {
  const requestId = generateRequestId();
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.requestId === requestId && event.data.api === 'LocalStorage:Response') {
        window.removeEventListener('message', handler);

        resolve(event.data.result);
      }
    };
    window.addEventListener('message', handler);

    window.postMessage({
      api: 'LocalStorage',
      action,
      key,
      value,
      requestId
    });
  });
}

// eslint-disable-next-line no-unused-vars
const windowStorage = {
  getItem: function (key: string): Promise<string | null> {
    return sendMessage('getItem', key);
  },

  setItem: function (key: string, value: any): Promise<void> {
    console.log('setting item');

    return sendMessage('setItem', key, value);
  },

  removeItem: function (key: string): Promise<void> {
    return sendMessage('removeItem', key);
  },

  clear: function (): Promise<void> {
    return sendMessage('clear');
  }
};

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const router = useRouter();

  const getLink = (origin: string, path: string) => `${origin}${router.basePath}${path}`;
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  const basePath = getLink(window.location.origin, '/xxdk-wasm');
  useEffect(() => {
    if (!utilsLoaded) {
      // By default the library uses an s3 bucket endpoint to download at
      // https://elixxir-bins.s3-us-west-1.amazonaws.com/wasm/xxdk-wasm-[semver]
      // the wasm resources, but you can host them locally by
      // symlinking your public directory:
      //   cd public && ln -s ../node_modules/xxdk-wasm xxdk-wasm && cd ..
      // Then override with this function here:
      setXXDKBasePath(window!.location.href + 'xxdk-wasm');

      // NOTE: NextJS hackery, since they can't seem to provide a helper to get a proper origin...
      setXXDKBasePath(basePath);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.localStoragePromise = windowStorage;
      // eslint-disable-next-line no-console
      console.log('useEffect wxxdkToStr', window!.xxdkBasePath.toString());

      InitXXDK().then(async (result: any) => {
        setUtils(result);
        setUtilsLoaded(true);
      });
    }
  }, [basePath, setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
