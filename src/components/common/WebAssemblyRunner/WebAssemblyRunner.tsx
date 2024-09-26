import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';

import { InitXXDK, setXXDKBasePath } from 'xxdk-wasm';

import { useUtils } from 'src/contexts/utils-context';
import { useRouter } from 'next/router';


type Logger = {
  StopLogging: () => void,
  GetFile: () => Promise<string>,
  Threshold: () => number,
  MaxSize: () => number,
  Size: () => Promise<number>,
  Worker: () => Worker,
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
      //setXXDKBasePath(window!.location.href + 'xxdk-wasm');

      // NOTE: NextJS hackery, since they can't seem to provide a helper to get a proper origin...
      setXXDKBasePath(basePath);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      InitXXDK().then(async(result: any) => {
        setUtils(result);
        setUtilsLoaded(true);
      });
    }
  }, [basePath, setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
