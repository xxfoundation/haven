import type { ChannelManager } from './network-client-context'
import React, { FC, useState, useRef } from 'react';
import { CMix } from './network-client-context';

export enum PrivacyLevel {
  Public = 0,
  Private = 1,
  Secret = 2
}

type MessageReceivedCallback = (uuid: string, channelId: Uint8Array, update: boolean) => void;

type DummyTraffic = {
  GetStatus: () => boolean;
  SetStatus: (status: boolean) => void;
}

export type ChannelDbCipher = {
  GetID: () => number;
  Decrypt: (plaintext: Uint8Array) => Uint8Array;
}

export type XXDKUtils = {
  NewCmix: (ndf: string, storageDir: string, password: Uint8Array, registrationCode: string) => void;
  LoadCmix: (storageDirectory: string, password: Uint8Array, cmixParams: Uint8Array) => Promise<CMix>;
  GetDefaultCMixParams: () => Uint8Array;
  GenerateChannel: (cmixId: number, channelname: string, description: string, privacyLevel: PrivacyLevel) => Uint8Array;
  GetChannelInfo: (prettyPrint: string) => Uint8Array;
  Base64ToUint8Array: (base64: string) => Uint8Array;
  GenerateChannelIdentity: (cmixId: number) => Uint8Array;
  NewChannelsManagerWithIndexedDb: (
    cmidId: number,
    privateIdentity: Uint8Array,
    onMessage: MessageReceivedCallback,
    channelDbCipher: number
  ) => Promise<ChannelManager>;
  LoadChannelsManagerWithIndexedDb: (cmixId: number, storageTag: string, onMessage: MessageReceivedCallback, channelDbCipher: number) => ChannelManager;
  GetPublicChannelIdentityFromPrivate: (privateKey: Uint8Array) => Uint8Array;
  IsNicknameValid: (nickname: string) => null;
  GetShareUrlType: (url: string) => PrivacyLevel;
  GetVersion: () => string;
  GetClientVersion: () => string;
  GetOrInitPassword: (password: string) => Uint8Array;
  ImportPrivateIdentity: (password: string, privateIdentity: Uint8Array) => Uint8Array;
  ConstructIdentity: (publicKey: Uint8Array, codesetVersion: number) => Uint8Array;
  DecodePrivateURL: (url: string, password: string) => string;
  DecodePublicURL: (url: string) => string;
  GetChannelJSON: (prettyPrint: string) => Uint8Array;
  NewDummyTrafficManager: (
    cmidId: number,
    maximumOfMessagesPerCycle: number,
    durationToWaitBetweenSendsMilliseconds: number,
    upperBoundIntervalBetweenCyclesMilliseconds: number
  ) => DummyTraffic;
  NewChannelsDatabaseCipher: (cmixId: number, storagePassword: Uint8Array, payloadMaximumSize: number) => ChannelDbCipher;
  Purge: (storageDirectory: string, userPassword: string) => void;
}

const initialUtils = {
  shouldRenderImportCodeNameScreen: false,
} as unknown as XXDKUtils;

type XXDKContext = {
  utils: XXDKUtils;
  setUtils: (utils: XXDKUtils) => void;
  utilsLoaded: boolean;
  setUtilsLoaded: (loaded: boolean) => void;
  transferIdentityVariables: any;
  shouldRenderImportCodeNameScreen: boolean;
  setShouldRenderImportCodeNameScreen: (shouldRender: boolean) => void;
}

export const UtilsContext = React.createContext<XXDKContext>({
  utils: initialUtils,
  utilsLoaded: false,
  transferIdentittyVariables: {},
  shouldRenderImportCodeNameScreen: false,
} as unknown as XXDKContext);

UtilsContext.displayName = 'UtilsContext';

export const UtilsProvider: FC<any> = props => {
  const [utils, setUtils] = useState<XXDKUtils>(initialUtils);
  const [utilsLoaded, setUtilsLoaded] = useState<boolean>(false);
  const transferIdentityVariables = useRef<any>({});
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
        transferIdentityVariables,
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
