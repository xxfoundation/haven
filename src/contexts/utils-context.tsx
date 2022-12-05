import React, { FC, useState, useRef } from 'react';
import { CMix } from 'src/types/cmix';

export interface IHelperMethods {
  NewCmix: Function;
  LoadCmix: (statePath: string, storageDirectory: string, password: string) => CMix;
  GetDefaultCMixParams: Function;
  GenerateChannel: Function;
  GetChannelInfo: Function;
  Base64ToUint8Array: Function;
  GenerateChannelIdentity: Function;
  NewChannelsManagerWithIndexedDb: Function;
  LoadChannelsManagerWithIndexedDb: Function;
  GetPublicChannelIdentityFromPrivate: Function;
  IsNicknameValid: Function;
  GetShareUrlType: Function;
  GetVersion: Function;
  GetClientVersion: Function;
  GetOrInitPassword: (password: string) => any;
  ImportPrivateIdentity: Function;
  ConstructIdentity: Function;
  DecodePrivateURL: Function;
  DecodePublicURL: Function;
  GetChannelJSON: Function;
  NewDummyTrafficManager: Function;
  NewChannelsDatabaseCipher: Function;
  Purge: Function;
}

const initialUtils = {
  NewCmix: () => {},
  LoadCmix: () => {},
  GetDefaultCMixParams: () => {},
  GenerateChannel: () => {},
  GetChannelInfo: () => {},
  Base64ToUint8Array: () => {},
  GenerateChannelIdentity: () => {},
  NewChannelsManagerWithIndexedDb: () => {},
  LoadChannelsManagerWithIndexedDb: () => {},
  GetPublicChannelIdentityFromPrivate: () => {},
  IsNicknameValid: () => {},
  GetShareUrlType: () => {},
  GetVersion: () => {},
  GetClientVersion: () => {},
  GetOrInitPassword: () => {},
  ImportPrivateIdentity: () => {},
  ConstructIdentity: () => {},
  DecodePrivateURL: () => {},
  DecodePublicURL: () => {},
  GetChannelJSON: () => {},
  NewDummyTrafficManager: () => {},
  NewChannelsDatabaseCipher: () => {},
  shouldRenderImportCodeNameScreen: false,
  setShouldRenderImportCodeNameScreen: () => {},
  Purge: () => {}
};

export const UtilsContext = React.createContext<{
  utils: IHelperMethods;
  setUtils: Function;
  utilsLoaded: boolean;
  setUtilsLoaded: Function;
  transferIdentittyVariables: any;
  shouldRenderImportCodeNameScreen: boolean;
  setShouldRenderImportCodeNameScreen: Function;
}>({
  utils: initialUtils,
  setUtils: () => {},
  utilsLoaded: false,
  setUtilsLoaded: () => {},
  transferIdentittyVariables: {},
  shouldRenderImportCodeNameScreen: false,
  setShouldRenderImportCodeNameScreen: () => {}
});

UtilsContext.displayName = 'UtilsContext';

export const UtilsProvider: FC<any> = props => {
  const [utils, setUtils] = useState<IHelperMethods>(initialUtils);
  const [utilsLoaded, setUtilsLoaded] = useState<boolean>(false);
  const transferIdentittyVariables = useRef<any>({});
  const [
    shouldRenderImportCodeNameScreen,
    setShouldRenderImportCodeNameScreen
  ] = useState(false);

  return (
    <UtilsContext.Provider
      value={{
        utils,
        setUtils,
        utilsLoaded,
        setUtilsLoaded,
        transferIdentittyVariables,
        shouldRenderImportCodeNameScreen,
        setShouldRenderImportCodeNameScreen
      }}
      {...props}
    />
  );
};

export const useUtils = () => {
  const context = React.useContext(UtilsContext);

  if (context === undefined) {
    throw new Error('useUtils must be used within a UtilsProvider');
  }

  return context;
};

export const ManagedUtilsContext: FC<any> = ({ children }) => (
  <UtilsProvider>{children}</UtilsProvider>
);
