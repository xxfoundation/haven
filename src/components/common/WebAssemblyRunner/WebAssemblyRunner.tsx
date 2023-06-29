import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';
import { XXDK_PATH } from 'src/constants';

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
    onWasmInitialized: () => void;
    Crash: () => void;
    GetLogger: () => Logger;
    logger?: Logger;
    getCrashedLogFile: () => Promise<string>;
  }
}

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
      const isReady = new Promise<void>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.onWasmInitialized = resolve;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const go = new (window as any).Go();
      go.argv = [
        '--logLevel=1',
        '--fileLogLevel=1',
        '--workerScriptURL=integrations/assets/logFileWorker.js',
      ]
      
      WebAssembly?.instantiateStreaming(fetch(XXDK_PATH), go.importObject).then(
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
            LoadNotifications,
            LoadNotificationsDummy,
            LoadSynchronizedCmix,
            NewChannelsManagerWithIndexedDb,
            NewCmix,
            NewDMClientWithIndexedDb,
            NewDatabaseCipher,
            NewDummyTrafficManager,
            NewSynchronizedCmix,
            Purge,
            ValidForever,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } = (window as any) || {};

          const { GetLogger } = window;

          setUtils({
            NewCmix,
            NewSynchronizedCmix,
            LoadCmix,
            LoadNotifications,
            LoadNotificationsDummy,
            LoadSynchronizedCmix,
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
            NewDatabaseCipher,
            NewDummyTrafficManager,
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
