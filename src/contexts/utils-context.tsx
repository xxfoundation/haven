import React, { FC, useState, useRef } from 'react';
import { CMix } from './network-client-context';

export enum PrivacyLevel {
  Public = 0,
  Private = 1,
  Secret = 2
}

export interface HelperMethods {
  NewCmix: (ndf: string, storageDir: string, password: Uint8Array, registrationCode: string) => void;
  LoadCmix: (storageDirectory: string, password: Uint8Array, cmixParams: Uint8Array) => Promise<CMix>;
  GetDefaultCMixParams: () => Uint8Array;
  GenerateChannel: (cmixId: number, channelname: string, description: string, privacyLevel: PrivacyLevel) => Uint8Array;
  GetChannelInfo: (prettyPrint: string) => Uint8Array;
  Base64ToUint8Array: (base64: string) => Uint8Array;
  GenerateChannelIdentity: (cmixId: number) => Uint8Array;
  NewChannelsManagerWithIndexedDb: (cmidId: number, privateIdentity: Uint8Array) => void;
  LoadChannelsManagerWithIndexedDb: Function;
  GetPublicChannelIdentityFromPrivate: (privateKey: Uint8Array) => Uint8Array;
  IsNicknameValid: Function;
  GetShareUrlType: (url: string) => PrivacyLevel;
  GetVersion: () => string;
  GetClientVersion: () => string;
  GetOrInitPassword: (password: string) => Uint8Array;
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
  utils: HelperMethods;
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
  const [utils, setUtils] = useState<HelperMethods>(initialUtils);
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
