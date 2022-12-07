import { FC, useEffect } from 'react';

import { useUtils } from 'src/contexts/utils-context';

const WebAssemblyRunner: FC<{ children: any }> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
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
            GenerateChannel,
            GenerateChannelIdentity,
            GetChannelInfo,
            GetChannelJSON,
            GetClientVersion,
            GetDefaultCMixParams,
            GetOrInitPassword,
            GetPublicChannelIdentityFromPrivate,
            GetShareUrlType,
            GetVersion,
            ImportPrivateIdentity,
            IsNicknameValid,
            LoadChannelsManagerWithIndexedDb,
            LoadCmix,
            LogLevel,
            LogToFile,
            NewChannelsDatabaseCipher,
            NewChannelsManagerWithIndexedDb,
            NewCmix,
            NewDummyTrafficManager,
            Purge
          } = (window as any) || {};

          setUtils({
            NewCmix,
            GenerateChannel,
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
            ImportPrivateIdentity,
            ConstructIdentity,
            DecodePrivateURL,
            DecodePublicURL,
            GetChannelJSON,
            NewDummyTrafficManager,
            NewChannelsDatabaseCipher,
            Purge
          });

          if (LogLevel) {
            LogLevel(2);
          }
          
          const logFile = LogToFile(0, 'receiver.log', 5000000);
          (window as any).logFile = logFile;
          setUtilsLoaded(true);
        }
      );
    }
  }, [setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;