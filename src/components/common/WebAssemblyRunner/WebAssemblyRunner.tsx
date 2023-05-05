import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';

import { useUtils } from 'src/contexts/utils-context';

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
    Crash: () => void;
    GetLogger: () => Logger;
    logger?: Logger;
    getCrashedLogFile: () => Promise<string>;
  }
}

const isReady = new Promise((resolve) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.onWasmInitialized = resolve;
});

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const go = new (window as any).Go();
      go.argv = [
        '--logLevel=1',
        '--fileLogLevel=1',
        '--workerScriptURL=integrations/assets/logFileWorker.js',
      ]
      const binPath = '/integrations/assets/xxdk.wasm';
      WebAssembly?.instantiateStreaming(fetch(binPath), go.importObject).then(
        async (result) => {
          go?.run(result?.instance);
          await isReady;
          const {
            Base64ToUint8Array,
            ConstructIdentity,
            DecodePrivateURL,
            DecodePublicURL,
            GenerateChannelIdentity,
            GetChannelInfo,
            GetChannelJSON,
            GetClientVersion,
            GetDefaultCMixParams,
            GetOrInitPassword,
            GetPublicChannelIdentityFromPrivate,
            GetShareUrlType,
            GetVersion,
            GetWasmSemanticVersion,
            ImportPrivateIdentity,
            IsNicknameValid,
            LoadChannelsManagerWithIndexedDb,
            LoadCmix,
            NewChannelsDatabaseCipher,
            NewChannelsManagerWithIndexedDb,
            NewCmix,
            NewDMClientWithIndexedDb,
            NewDMsDatabaseCipher,
            NewDummyTrafficManager,
            Purge,
            ValidForever,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } = (window as any) || {};

          const { GetLogger } = window;

          setUtils({
            NewCmix,
            LoadCmix,
            GetChannelInfo,
            GenerateChannelIdentity,
            GetDefaultCMixParams,
            NewChannelsManagerWithIndexedDb,
            Base64ToUint8Array,
            LoadChannelsManagerWithIndexedDb,
            GetPublicChannelIdentityFromPrivate,
            IsNicknameValid,
            GetShareUrlType,
            GetVersion,
            GetClientVersion,
            GetOrInitPassword,
            GetWasmSemanticVersion,
            ImportPrivateIdentity,
            ConstructIdentity,
            DecodePrivateURL,
            DecodePublicURL,
            GetChannelJSON,
            NewDMClientWithIndexedDb,
            NewDMsDatabaseCipher,
            NewDummyTrafficManager,
            NewChannelsDatabaseCipher,
            Purge,
            ValidForever
          });


          if(GetLogger) {
            const logger = GetLogger()

            // Get the actual Worker object from the log file object
            const w = logger.Worker()

            window.getCrashedLogFile = () => {
              return new Promise((resolve) => {
                w.addEventListener('message', ev => {
                  resolve(atob(JSON.parse(ev.data).data))
                })
                w.postMessage(JSON.stringify({ tag: 'GetFileExt' }))
              });
            };

            window.logger = logger
          }


          setUtilsLoaded(true);
        }
      );
    }
  }, [setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
