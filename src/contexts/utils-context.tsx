import type { ChannelManager } from './network-client-context'
import React, { FC, useState } from 'react';
import { CMix } from './network-client-context';
import { WithChildren } from '@types';

export enum PrivacyLevel {
  Public = 0,
  Private = 1,
  Secret = 2
}

export type DummyTraffic = {
  GetStatus: () => boolean;
  SetStatus: (status: boolean) => void;
}

export type ChannelDbCipher = {
  GetID: () => number;
  Decrypt: (plaintext: Uint8Array) => Uint8Array;
}

export type ChannelJSON = {
  ChannelID: string;
  ReceptionID: string;
  Name: string;
  Description: string;
  Level: PrivacyLevel;
  Channel: string;
}

export type MessageReceivedCallback = (uuid: string, channelId: Uint8Array, update: boolean) => void;

export type XXDKUtils = {
  NewCmix: (ndf: string, storageDir: string, password: Uint8Array, registrationCode: string) => Promise<void>;
  LoadCmix: (storageDirectory: string, password: Uint8Array, cmixParams: Uint8Array) => Promise<CMix>;
  GetDefaultCMixParams: () => Uint8Array;GetChannelInfo: (prettyPrint: string) => Uint8Array;
  Base64ToUint8Array: (base64: string) => Uint8Array;
  GenerateChannelIdentity: (cmixId: number) => Uint8Array;
  NewChannelsManagerWithIndexedDb: (
    cmidId: number,
    privateIdentity: Uint8Array,
    onMessage: MessageReceivedCallback,
    channelDbCipher: number
  ) => Promise<ChannelManager>;
  LoadChannelsManagerWithIndexedDb: (
    cmixId: number,
    storageTag: string,
    onMessage: MessageReceivedCallback,
    channelDbCipher: number
  ) => Promise<ChannelManager>;
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
  ValidForever: () => number;
}

const initialUtils = {
  shouldRenderImportCodeNameScreen: false,
} as unknown as XXDKUtils;

type XXDKContext = {
  utils: XXDKUtils;
  setUtils: (utils: XXDKUtils) => void;
  utilsLoaded: boolean;
  setUtilsLoaded: (loaded: boolean) => void;
}

export const UtilsContext = React.createContext<XXDKContext>({
  utils: initialUtils,
  utilsLoaded: false,
  shouldRenderImportCodeNameScreen: false,
} as unknown as XXDKContext);

UtilsContext.displayName = 'UtilsContext';

export const UtilsProvider: FC<WithChildren> = ({ children }) => {
  const [utils, setUtils] = useState<XXDKUtils>(initialUtils);
  const [utilsLoaded, setUtilsLoaded] = useState<boolean>(false);

  return (
    <UtilsContext.Provider
      value={{
        utils,
        setUtils,
        utilsLoaded,
        setUtilsLoaded,
      }}
    >
      {children}
    </UtilsContext.Provider>
  );
};

export const useUtils = () => {
  const context = React.useContext(UtilsContext);

  if (context === undefined) {
    throw new Error('useUtils must be used within a UtilsProvider');
  }

  return context;
};

export const ManagedUtilsContext: FC<WithChildren> = ({ children }) => (
  <UtilsProvider>{children}</UtilsProvider>
);
