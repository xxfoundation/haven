import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';

import { useUtils } from 'src/contexts/utils-context';

type LogFile = { Name: () => string, GetFile: () => string };

declare global {
  interface Window {
    LogToFile: (level: number, path: string, maxLogFileSizeBytes: number) => LogFile;
    logFile?: LogFile;
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

          const { LogToFile } = window;

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
            LogLevel(2);
          }
          
          const logFile = LogToFile(0, 'receiver.log', 5000000);
          window.logFile = logFile;
          setUtilsLoaded(true);
        }
      );
    }
  }, [setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
