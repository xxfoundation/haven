import type { WithChildren } from 'src/types';

import { FC, useEffect } from 'react';
//import { useLocation } from 'react-router-dom';

import { InitXXDK, setXXDKBasePath } from 'xxdk-wasm';

import { useUtils } from 'src/contexts/utils-context';

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
    havenStorage: HavenStorage;
    xxdkBasePath: URL;
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
        console.log('event.data response', event.data);

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

type HavenStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  key: (index: number) => Promise<string | null>;
};

// eslint-disable-next-line no-unused-vars
const havenStorage: HavenStorage = {
  getItem: function (key: string): Promise<string | null> {
    return sendMessage('getItem', key);
  },

  setItem: function (key: string, value: any): Promise<void> {
    return sendMessage('setItem', key, value);
  },

  delete: function (key: string): Promise<void> {
    return sendMessage('removeItem', key);
  },

  clear: function (): Promise<void> {
    return sendMessage('clear');
  },

  keys: function (): Promise<string[]> {
    return sendMessage('keys');
  },

  key: function (index: number): Promise<string | null> {
    // This string is used in go to compare the error
    return Promise.reject(new Error('not implemented'));
  }
};

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  //const location = useLocation();

  const getLink = (origin: string, path: string) => `${origin}${path}`;
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
      // window!.xxdkBasePath = window!.location.href + 'xxdk-wasm';
      // NOTE: NextJS hackery, since they can't seem to provide a helper to get a proper origin...
      setXXDKBasePath(basePath);

      window.havenStorage = havenStorage;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // window.localStoragePromise = windowStorage;
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
