import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';

import { useUtils } from 'src/contexts/utils-context';

type Logger = {
  LogToFile: (level: number, maxLogFileSizeBytes: number) => void,
  LogToFileWorker: (level: number, maxLogFileSizeBytes: number,
                    wasmJsPath: string, workerName: string) => Promise<void>,
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

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const go = new (window as any).Go();
      const binPath = '/integrations/assets/xxdk.wasm';
      WebAssembly?.instantiateStreaming(fetch(binPath), go.importObject).then(
        async (result) => {
          go?.run(result?.instance);
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
            LogLevel,
            NewChannelsDatabaseCipher,
            NewChannelsManagerWithIndexedDb,
            NewCmix,
            NewDummyTrafficManager,
            Purge,
            ValidForever,

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } = (window as any) || {};

          const { Crash, GetLogger } = window;

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
            NewDummyTrafficManager,
            NewChannelsDatabaseCipher,
            Purge,
            ValidForever
          });

          if (LogLevel) {
            LogLevel(1);
          }


          const logger = GetLogger()

          const wasmJsPath = 'integrations/assets/logFileWorker.js';
          await logger.LogToFileWorker(
            0, 5000000, wasmJsPath, 'xxdkLogFileWorker').catch((err) => {
            throw new Error(err)
          })

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


          window.Crash = Crash
          setUtilsLoaded(true);
        }
      );
    }
  }, [setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
