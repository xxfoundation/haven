import { FC, useEffect } from "react";

import { useUtils } from "contexts/utils-context";

const WebAssemblyRunner: FC<{ children: any }> = ({ children }) => {
  const { setUtils, utilsLoaded, setUtilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
      const go = new (window as any).Go();
      const binPath = "/integrations/assets/xxdk.wasm";
      WebAssembly?.instantiateStreaming(fetch(binPath), go.importObject).then(
        async (result: any) => {
          go?.run(result?.instance);
          const {
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
            LogToFile,
            LogLevel,
            GetShareUrlType,
            GetVersion,
            GetClientVersion,
            GetOrInitPassword,
            ImportPrivateIdentity,
            ConstructIdentity,
            DecodePrivateURL,
            DecodePublicURL,
            GetChannelJSON,
            NewDummyTrafficManager
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
            NewDummyTrafficManager
          });

          if (LogLevel) {
            LogLevel(4);
          }
          const logFile = LogToFile(0, "receiver.log", 5000000);
          (window as any).logFile = logFile;
          setUtilsLoaded(true);
        }
      );
    }
  }, [utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
