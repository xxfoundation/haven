import type { WithChildren } from 'src/types';

import { FC, useEffect } from 'react';
//import { useLocation } from 'react-router-dom';

import { InitXXDK, setXXDKBasePath } from 'xxdk-wasm';

import { useUtils } from 'src/contexts/utils-context';
import { havenStorageExtension } from './haven-storage-extension';
import { havenStorageLocal } from './local-storage';
import { HavenStorage } from './type';

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
  }
}

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
      // NOTE: NextJS hackery, since they can't seem to provide a helper to get a proper origin...
      // setXXDKBasePath(basePath);

      const initXXdk = async () => {
        if (localStorage.getItem('🞮🞮speakeasyapp') === null) {
          const isAvailable = await havenStorageExtension.init();
          if (isAvailable) {
            console.log('[HavenStorage] Using extension storage since extension is available');
            window.havenStorage = havenStorageExtension;
          } else {
            console.log('[HavenStorage] Using localStorage since extension is not available');
            window.havenStorage = havenStorageLocal;
          }
        } else {
          console.log('[HavenStorage] Using localStorage due to existing keys');
          window.havenStorage = havenStorageLocal;
        }

        const xxdkUtils = await InitXXDK();
        setUtils(xxdkUtils);
        setUtilsLoaded(true);
      };

      initXXdk();
    }
  }, [basePath, setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
